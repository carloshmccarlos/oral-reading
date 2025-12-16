import { Spinner } from '@/components/ui'

export default function Loading () {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-container items-center justify-center px-8">
      <Spinner size="lg" />
    </div>
  )
}
