"use client";

import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged, User } from "firebase/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type WorkDay = {
  date: Date;
  startTime: Date | null;
  endTime: Date | null;
  breaks: { start: Date; end: Date }[];
};

export default function CompanyEmployeesTab() {
  const [user, setUser] = useState<User | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [employeeServices, setEmployeeServices] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<WorkDay[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "companies"), where("ownerId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const companyDoc = querySnapshot.docs[0];
          setCompanyId(companyDoc.id);
          await loadEmployees(companyDoc.id);
          await loadServices(companyDoc.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadEmployees = async (companyId: string) => {
    const q = query(collection(db, "companies", companyId, "employees"));
    const snapshot = await getDocs(q);
    const data: any[] = [];
    snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
    setEmployees(data);
  };

  const loadServices = async (companyId: string) => {
    const q = query(collection(db, "companies", companyId, "services"));
    const snapshot = await getDocs(q);
    const data: any[] = [];
    snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
    setServices(data);
  };

  const uploadPhoto = (file: File, employeeId: string) => {
    return new Promise<string>((resolve, reject) => {
      const storageRef = ref(storage, `employee_photos/${employeeId}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (err) => reject(err),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleAddEmployee = async () => {
    if (!companyId) return;
    setSaving(true);

    try {
      const newEmployee = {
        name,
        position,
        email,
        phone,
        photoURL,
        services: employeeServices,
        schedule: schedule.map(d => ({
          date: d.date,
          startTime: d.startTime,
          endTime: d.endTime,
          breaks: d.breaks,
        })),
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "companies", companyId, "employees"), newEmployee);

      let uploadedPhotoURL = photoURL;
      if (photoFile) {
        uploadedPhotoURL = await uploadPhoto(photoFile, docRef.id);
        await updateDoc(doc(db, "companies", companyId, "employees", docRef.id), { photoURL: uploadedPhotoURL });
      }

      setEmployees([...employees, { id: docRef.id, ...newEmployee, photoURL: uploadedPhotoURL }]);

      setName(""); setPosition(""); setEmail(""); setPhone(""); setPhotoFile(null); setPhotoURL(null); setEmployeeServices([]); setSchedule([]);
    } catch (err) {
      console.error(err);
      alert("Failed to add employee");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!companyId) return;
    await deleteDoc(doc(db, "companies", companyId, "employees", employeeId));
    setEmployees(employees.filter((e) => e.id !== employeeId));
  };

  const handleFileChange = (file: File) => { setPhotoFile(file); setPhotoURL(URL.createObjectURL(file)); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); if(e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const removePhoto = () => { setPhotoFile(null); setPhotoURL(null); };

  const addWorkDay = () => setSchedule([...schedule, { date: new Date(), startTime: null, endTime: null, breaks: [] }]);
  const updateWorkDay = (index: number, field: keyof WorkDay, value: any) => { const newSchedule = [...schedule]; newSchedule[index][field] = value; setSchedule(newSchedule); };
  const addBreak = (index: number) => { const newSchedule = [...schedule]; newSchedule[index].breaks.push({ start: new Date(), end: new Date() }); setSchedule(newSchedule); };
  const updateBreak = (dayIndex: number, breakIndex: number, field: "start" | "end", value: Date) => { const newSchedule = [...schedule]; newSchedule[dayIndex].breaks[breakIndex][field] = value; setSchedule(newSchedule); };

  if (loading) return <p className="text-gray-500 text-center mt-10">Loading employees...</p>;
  if (!user) return <p className="text-red-500 text-center mt-10">Please log in to view employees.</p>;

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Add New Employee</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Position</label>
            <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Position" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Photo</label>
            <div
              className="w-48 h-48 border border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden relative cursor-pointer"
              onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current?.click()}
            >
              {photoURL ? (
                <>
                  <img src={photoURL} alt="Employee" className="w-full h-full object-cover rounded-xl" />
                  <button type="button" onClick={(e)=>{e.stopPropagation(); removePhoto();}} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow">×</button>
                </>
              ) : <span className="text-gray-400 text-center text-sm px-2">Drag & Drop or Click to Upload</span>}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e)=>e.target.files && handleFileChange(e.target.files[0])} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Services Employee Can Perform</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map(s => (
                <label key={s.id} className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={employeeServices.includes(s.id)}
                    onChange={(e) => {
                      if(e.target.checked) setEmployeeServices([...employeeServices, s.id]);
                      else setEmployeeServices(employeeServices.filter(id => id !== s.id));
                    }}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-gray-700">{s.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-2">
            <label className="block text-gray-700 font-medium mb-1">Work Schedule</label>
            {schedule.map((day, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2 bg-gray-50">
                <div className="flex gap-4 items-center">
                  <DatePicker selected={day.date} onChange={(d)=>updateWorkDay(i, "date", d)} dateFormat="dd.MM.yyyy" className="border px-2 py-1 rounded-lg" />
                  <DatePicker selected={day.startTime} onChange={(d)=>updateWorkDay(i,"startTime",d)} showTimeSelect showTimeSelectOnly timeIntervals={15} timeCaption="Start" dateFormat="HH:mm" placeholderText="Start" className="border px-2 py-1 rounded-lg" />
                  <DatePicker selected={day.endTime} onChange={(d)=>updateWorkDay(i,"endTime",d)} showTimeSelect showTimeSelectOnly timeIntervals={15} timeCaption="End" dateFormat="HH:mm" placeholderText="End" className="border px-2 py-1 rounded-lg" />
                  <Button onClick={()=>addBreak(i)} className="bg-gray-200 text-gray-800">+ Break</Button>
                </div>
                {day.breaks.map((b, bi) => (
                  <div key={bi} className="flex gap-2 items-center ml-4">
                    <DatePicker selected={b.start} onChange={(d)=>updateBreak(i,bi,"start",d!)} showTimeSelect showTimeSelectOnly timeIntervals={15} timeCaption="Break Start" dateFormat="HH:mm" className="border px-2 py-1 rounded-lg" />
                    <DatePicker selected={b.end} onChange={(d)=>updateBreak(i,bi,"end",d!)} showTimeSelect showTimeSelectOnly timeIntervals={15} timeCaption="Break End" dateFormat="HH:mm" className="border px-2 py-1 rounded-lg" />
                  </div>
                ))}
              </div>
            ))}
            <Button onClick={addWorkDay} className="bg-blue-600 text-white mt-2">+ Add Work Day</Button>
          </div>

        </div>

        <Button onClick={handleAddEmployee} className={`bg-blue-600 text-white w-full ${saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}`} disabled={saving}>
          {saving ? "Saving..." : "Add Employee"}
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-gray-50 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <img src={emp.photoURL || "/placeholder.png"} alt={emp.name} className="w-20 h-20 object-cover rounded-xl" />
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{emp.name}</p>
              <p className="text-gray-600">{emp.position}</p>
              <p className="text-gray-500 text-sm">{emp.email} | {emp.phone}</p>
              <p className="text-gray-500 text-sm mt-1">
                Services: {emp.services?.map((sid: any) => services.find(s=>s.id===sid)?.title).join(", ")}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Schedule:
                {emp.schedule?.length > 0 ? (
                    emp.schedule.map((d: any, i: number) => {
                    const date = d.date?.seconds ? new Date(d.date.seconds * 1000) : new Date(d.date);
                    const start = d.startTime
                        ? new Date(d.startTime.seconds ? d.startTime.seconds * 1000 : d.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "-";
                    const end = d.endTime
                        ? new Date(d.endTime.seconds ? d.endTime.seconds * 1000 : d.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "-";

                    const breaks = d.breaks?.length
                        ? d.breaks.map((b: any) => {
                            const bStart = new Date(b.start.seconds ? b.start.seconds * 1000 : b.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            const bEnd = new Date(b.end.seconds ? b.end.seconds * 1000 : b.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            return `${bStart}-${bEnd}`;
                        }).join(", ")
                        : "No breaks";

                    return (
                        <span key={i} className="block">
                        {date.toLocaleDateString()} ({start} - {end}, Breaks: {breaks})
                        </span>
                    );
                    })
                ) : (
                    <span className="ml-1">No schedule set</span>
                )}
                </p>

            </div>
            <button onClick={() => handleDeleteEmployee(emp.id)} className="text-red-600 font-bold hover:text-red-800">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
