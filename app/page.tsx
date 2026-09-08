import Link from 'next/link'
import { Building2, MessageCircleMore, Users } from 'lucide-react'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />

      <main className="flex-1">
        <section className="relative bg-brand-gradient overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center relative">
            <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 mb-6 ring-1 ring-inset ring-indigo-100">
              Corretor de IA para imobiliárias
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 tracking-tight text-balance">
              Sua imobiliária com um{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                corretor de IA
              </span>{' '}
              disponível 24h
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto text-balance">
              Cadastre seus imóveis, deixe a IA da PropIA tirar dúvidas dos visitantes e
              qualificar os leads automaticamente — e receba só quem está pronto para falar
              no WhatsApp.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Criar conta grátis
              </Link>
              <Link
                href="/auth/login"
                className="bg-white text-slate-700 px-6 py-3 rounded-xl font-medium ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 border-t border-slate-100">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Cadastre seus imóveis</h3>
              <p className="text-sm text-slate-600">
                Fotos, preço, condições de pagamento e diferenciais — tudo em um painel
                simples.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <MessageCircleMore className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">A IA atende os visitantes</h3>
              <p className="text-sm text-slate-600">
                Cada imóvel tem seu próprio assistente, treinado com as informações que você
                cadastrou.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Você recebe leads prontos</h3>
              <p className="text-sm text-slate-600">
                Leads qualificados são direcionados para o WhatsApp do corretor, prontos
                para fechar.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} PropIA
      </footer>
    </div>
  )
}
