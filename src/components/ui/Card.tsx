import { FC, ReactNode } from "react"
import clsx from "clsx"

interface CardProps {
  children: ReactNode
  className?: string
}

const Card: FC<CardProps> = ({ children, className }) => {
  return (
    <div className={clsx("bg-white shadow rounded-2xl p-6", className)}>
      {children}
    </div>
  )
}

export default Card
