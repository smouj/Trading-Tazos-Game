"use client"

import { useEffect, useRef } from "react"

/**
 * IntersectionObserver-based scroll reveal.
 * Adds `.visible` to `.ttg-reveal` elements as they enter the viewport.
 *
 * CSS handles the actual animation — see `globals.css` `.ttg-reveal` rules.
 */
export default function ScrollReveal() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            observer.unobserve(entry.target)
          }
        }
      },
      {
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.1,
      },
    )

    // Observe existing elements
    const reveals = document.querySelectorAll(".ttg-reveal")
    reveals.forEach((el) => observer.observe(el))

    // Also observe dynamically added elements (SPA navigation)
    const mutationObserver = new MutationObserver(() => {
      const newReveals = document.querySelectorAll(".ttg-reveal:not(.visible)")
      newReveals.forEach((el) => {
        if (!el.classList.contains("visible")) {
          observer.observe(el)
        }
      })
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return null
}
