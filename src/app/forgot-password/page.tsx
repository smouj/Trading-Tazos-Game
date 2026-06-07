'use client'

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#FFF9E6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-zinc-200 p-8">
        <div className="text-center mb-6">
          <img
            src="/logo/logo-icon-black.webp"
            alt="Trading Tazos"
            className="w-16 h-16 mx-auto mb-3"
          />
          <h1 className="text-2xl font-black text-[#1a1a1a] tracking-tight">
            Forgot Password
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const form = e.currentTarget
            const email = (form.elements.namedItem('email') as HTMLInputElement).value
            const msg = document.getElementById('forgot-msg')

            try {
              const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              })
              const data = await res.json()

              if (msg) {
                msg.textContent = data.message || 'Check your email for the reset link.'
                msg.className = 'text-sm text-green-600 text-center mt-3'
                msg.classList.remove('hidden')
              }
              ;(form.elements.namedItem('email') as HTMLInputElement).value = ''
            } catch {
              if (msg) {
                msg.textContent = 'Something went wrong. Please try again.'
                msg.className = 'text-sm text-red-500 text-center mt-3'
                msg.classList.remove('hidden')
              }
            }
          }}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-[#1a1a1a] mb-1.5">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 border-2 border-zinc-300 rounded-xl text-sm font-medium
                         focus:outline-none focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00]/20
                         transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 bg-[#FF004D] text-white font-black text-sm uppercase tracking-wider
                       rounded-xl border-2 border-[#FF004D]
                       shadow-[inset_2px_2px_0_#ffffff40,inset_-2px_-2px_0_#0003,4px_4px_0_#00000080]
                       hover:translate-x-[-2px] hover:translate-y-[-2px]
                       hover:shadow-[inset_2px_2px_0_#ffffff40,inset_-2px_-2px_0_#0003,6px_6px_0_#00000080]
                       active:translate-x-[1px] active:translate-y-[1px]
                       active:shadow-[inset_2px_2px_0_#0003,inset_-2px_-2px_0_#ffffff20,2px_2px_0_#00000080]
                       transition-all duration-100"
          >
            Send Reset Link
          </button>

          <p id="forgot-msg" className="text-sm text-green-600 text-center mt-3 hidden"></p>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-zinc-200">
          <a
            href="/login"
            className="text-sm font-bold text-[#1a1a1a]/60 hover:text-[#FF004D] transition-colors"
          >
            ← Back to Sign In
          </a>
        </div>
      </div>
    </main>
  )
}
