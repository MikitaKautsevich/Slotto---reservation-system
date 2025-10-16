import { FC, ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
}

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ")
}

const Card: FC<CardProps> = ({ children, className }) => {
  return (
    <div className={classNames("bg-white shadow rounded-2xl p-6", className)}>
      {children}
    </div>
  )
}

export default Card
