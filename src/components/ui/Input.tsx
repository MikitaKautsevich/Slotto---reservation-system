import { InputHTMLAttributes, FC } from "react"
import clsx from "clsx"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input: FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={clsx(
        "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300",
        className
      )}
      {...props}
    />
  )
}

export default Input
