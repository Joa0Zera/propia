import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function Navigation() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 font-bold text-xl text-slate-900">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          Prop<span className="text-indigo-600">IA</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Criar conta grátis
          </Link>
        </nav>
      </div>
    </header>
  )
}
