  # LinkedIn Post Draft — LinkedIn Post Studio Launch

  > **Status:** Draft v1.0 — ready for review
  > **Target length:** ~1500 chars (within LinkedIn's 3000 cap)
  > **Format:** Plain text (no Unicode styling yet) — paste into Post Studio, hit "Format with AI" → "Bold & Punchy"

  ---

  ## Post text

  I spent 6 weekends building the LinkedIn formatter I always wanted.

  It's called **LinkedIn Post Studio** — and it solves the 3 things every technical creator hates:

  → **Manual formatting that actually works on LinkedIn**
  Bold, italic, underline, strikethrough, 3 list styles, section breaks, blockquotes, highlights, H1/H2/H3 headings, even Script and Gothic fonts — all mapped to Unicode so they render natively inside LinkedIn's composer (no images, no rich text hacks).

  → **A live preview that matches LinkedIn's actual look**
  Toggle between desktop and mobile view. The card animates between the two. What you see is what your readers get.

  → **AI formatting that doesn't rewrite your words**
  This was the non-negotiable. Most AI tools silently paraphrase your post. Mine returns *formatting operations only* (style ranges, list markers, dividers) and applies them locally. The model is told "do not change a single word" — and the app verifies that the formatted text, when un-Unicoded, equals your original byte-for-byte.

  ```
  Architecture (for the curious):
    React + Vite frontend → GitHub Pages
    Spring Boot + Groq (qwen3.8-27b) → Render Docker
    Total cost: $0/month
    Response time: ~400ms per AI call
  ```

  The whole thing runs on the free tier of everything — Render, GitHub Pages, Groq, with an in-app self-ping so the backend never sleeps. I wrote a 900-line deployment guide because figuring out the "Render doesn't support Java natively" gotcha took longer than building the app itself.

  **Try it:** https://h-arshal.github.io/linkedin-post-studio/

  What feature would make you actually use a tool like this daily — live character-density scoring, AI hook suggestions, or direct publish to LinkedIn?

  ---

  ## Posting checklist

  - [ ] Copy the post text above (between the "## Post text" and "---" markers)
  - [ ] Open https://h-arshal.github.io/linkedin-post-studio/
  - [ ] Paste the text into the editor
  - [ ] Click **Format with AI** → select **"Bold & Punchy"** style
  - [ ] Review the preview — adjust if needed
  - [ ] Click **Copy** and paste into LinkedIn
  - [ ] Manually add 1-2 relevant hashtags at the bottom:
    - `#opensource` `#productivity` `#linkedin` `#webdev` `#buildinpublic`

  ## Optional: hashtags to consider (pick 3-5 max)

  - `#opensource` — accurate, attracts dev community
  - `#buildinpublic` — huge engagement for indie projects
  - `#webdev` / `#javascript` — reaches React/TS audience
  - `#linkedin` — meta but works for reach
  - `#indiehacker` — attracts like-minded builders
  - `#ai` — topical, reaches AI-curious audience

  ## Notes on the draft

  - **Hook (first 210 chars)**: "I spent 6 weekends building the LinkedIn formatter I always wanted. It's called LinkedIn Post Studio — and it solves the 3 things every technical creator hates:" — leads with relatable pain + concrete artifact
  - **Body**: Lists 3 problems with concrete solutions, one code snippet (architecture), social proof (free, fast, deployed), CTA link
  - **CTA question**: "What feature would make you actually use a tool like this daily" — drives comments (LinkedIn algorithm loves comments)
  - **Length**: ~1450 chars — well within LinkedIn's 3000 cap, leaves room for hashtags

  ## Variations to consider

  - **More punchy version**: Add "I almost didn't ship it." as the opening line for more vulnerability
  - **More technical version**: Replace the architecture snippet with a screenshot of the editor
  - **Shorter version (for a carousel)**: Use the 3-bullet structure as 3 slides

  ## Hashtags to skip

  - `#linkedinpoststudio` (your own name — looks spammy, has no reach)
  - `#productivityhacks` (generic, gets buried)
  - `#contentcreator` (too broad, wrong audience)
