import Link from 'next/link';

const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=37125612440&text=Sveiki%21%20K%C4%81%20varu%20pal%C4%ABdz%C4%93t%3F%20Rakstu%20par%20jumta%20pakalpojumiem.';

export default function WhatsAppFloatingButton() {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <Link
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer nofollow"
        aria-label="Rakstiet mums ziņu WhatsApp"
        className="group max-w-[18rem] overflow-hidden rounded-3xl border border-green-200 bg-white shadow-2xl shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-green-500/30 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-white"
      >
        <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] px-4 py-3 text-white">
          <div className="flex items-start gap-3">
            <span className="relative mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/20 opacity-30" />
              <svg
                className="relative h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.52 3.48A11.81 11.81 0 0 0 12.09 0C5.51 0 .16 5.34.16 11.92c0 2.1.55 4.14 1.58 5.93L0 24l6.33-1.66a11.88 11.88 0 0 0 5.76 1.48h.01c6.58 0 11.92-5.34 11.92-11.92 0-3.19-1.24-6.19-3.5-8.42Zm-8.43 18.32h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-3.75.98 1-3.66-.24-.38a9.88 9.88 0 0 1-1.51-5.2c0-5.46 4.45-9.9 9.92-9.9 2.65 0 5.14 1.03 7.01 2.9a9.85 9.85 0 0 1 2.91 7.01c0 5.47-4.45 9.85-9.92 9.85Zm5.76-7.86c-.32-.16-1.89-.93-2.18-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.5-2.55-1.61-.94-.84-1.57-1.87-1.75-2.19-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.98-2.35-.26-.63-.53-.54-.71-.55-.18 0-.39-.01-.61-.01-.21 0-.55.08-.84.4-.29.32-1.1 1.07-1.1 2.61s1.13 3.03 1.28 3.24c.16.21 2.2 3.36 5.35 4.71.75.32 1.33.51 1.78.65.75.24 1.43.2 1.97.12.6-.09 1.89-.77 2.16-1.51.26-.74.26-1.37.18-1.51-.08-.14-.29-.21-.61-.37Z" />
              </svg>
            </span>
            <div className="text-left">
               <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Chat</p>
              <p className="mt-1 whitespace-nowrap text-[13px] font-semibold leading-none">Sveiki! Kā varam jums palīdzēt?</p>
               <p className="mt-1 text-xs leading-snug text-white/90">Rakstiet mums ziņu, un mēs atbildēsim pēc iespējas ātrāk.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 bg-white px-4 py-3">
          <span className="text-xs font-medium text-gray-600">Sazinieties ar mums</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-3 py-1 text-xs font-semibold text-white transition-transform duration-300 group-hover:scale-105">
            Sūtīt ziņu
          </span>
        </div>
      </Link>
    </div>
  );
}
