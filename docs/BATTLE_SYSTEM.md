# 🎮 Trading Tazos Game — Documentación de Batalla

## Flujo de Juego (Battle Flow)

```
                            ┌────────────────────────────────────────┐
                            │       LOBBY — Selección de modo        │
                            │  Practice / Ranked / Friend            │
                            │  Auto-select best 5 tazos del deck     │
                            └─────────────────┬──────────────────────┘
                                              │ START
                            ┌─────────────────▼──────────────────────┐
                            │       INTRO — "GET READY!" (2s)        │
                            │  Camera flyover del arena              │
                            └─────────────────┬──────────────────────┘
                                              │ startNewRound()
                            ┌─────────────────▼──────────────────────┐
                            │    ROUND START — Colocar stakes        │
                            │  Cada jugador pone 1 tazo face-down    │
                            │  Se selecciona launcher (≠ staked)     │
                            └─────────────────┬──────────────────────┘
                                              │
     ╔═══════════════════════════════════════════════════════════════╗
     ║                        TURNO DEL JUGADOR                      ║
     ╠═══════════════════════════════════════════════════════════════╣
     ║                                                                 ║
     ║  ┌─────────────────────────────────────────────────────────┐  ║
     ║  │  🎯 AIM — Reticle automático en órbita elíptica          │  ║
     ║  │                                                           │  ║
     ║  │  • El reticle barre automáticamente entre los dos stakes  │  ║
     ║  │  • CONTROL stat → velocidad de órbita                     │  ║
     ║  │    Alto = lento y predecible (fácil)                      │  ║
     ║  │    Bajo = rápido y errático (difícil)                     │  ║
     ║  │  • PRECISION stat → cantidad de jitter/wobble             │  ║
     ║  │    Alto = mínima vibración                                │  ║
     ║  │    Bajo = temblor aleatorio fuerte                        │  ║
     ║  │  • CLIC 1: 🎯 LOCK AIM → congela la posición              │  ║
     ║  │  • CLIC 2: ⚡ CHARGE → pasa a la siguiente fase           │  ║
     ║  └─────────────────────────┬───────────────────────────────┘  ║
     ║                            │                                   ║
     ║  ┌─────────────────────────▼───────────────────────────────┐  ║
     ║  │  ⚡ CHARGE — Medidor de fuerza vertical (auto-fill 2s)  │  ║
     ║  │                                                           │  ║
     ║  │  • Barra se llena automáticamente de 0% → 100%           │  ║
     ║  │  • Sweet spot: 60-82% = PERFECT (verde)                  │  ║
     ║  │  • >82% = overcharge (rojo)                               │  ║
     ║  │  • Botón RELEASE NOW en cualquier momento                 │  ║
     ║  │    → Salta TILT y lanza directo con fuerza actual        │  ║
     ║  │  • Si llega al 100% → transición automática a TILT       │  ║
     ║  └─────────────────────────┬───────────────────────────────┘  ║
     ║                            │                                   ║
     ║  ┌─────────────────────────▼───────────────────────────────┐  ║
     ║  │  ↗ TILT — Dirección y giro (opcional)                    │  ║
     ║  │                                                           │  ║
     ║  │  • Drag pad → dirección del tilt (forward/back/side)     │  ║
     ║  │  • Slider → spin intensity 0-100%                        │  ║
     ║  │  • Botón 💥 SLAM! → lanza el tazo                       │  ║
     ║  │  • Tilt hacia el borde = +50% edge bonus                 │  ║
     ║  └─────────────────────────┬───────────────────────────────┘  ║
     ║                                                                 ║
     ╚═════════════════════════════╦═══════════════════════════════════╝
                                   │
     ┌─────────────────────────────▼───────────────────────────────┐
     │  💥 SLAMMING — Caída libre con gravedad                     │
     │  • Tazo cae desde la altura de carga                        │
     │  • Motion trail vertical visible                            │
     │  • Tiempo de caída = √(2h/22) × 1000ms                      │
     │  • El tazo se agranda 25% en altura máxima                  │
     └─────────────────────────────┬───────────────────────────────┘
                                   │
     ┌─────────────────────────────▼───────────────────────────────┐
     │  🧠 IMPACT — Motor de físicas (simulateSlam)                │
     │                                                               │
     │  • Distancia desde punto de impacto a cada stake             │
     │  • Fuerza = aimPrecision × verticalForce × timingAccuracy    │
     │    × (1 − dist²/cap) × (1 − wearPenalty)                    │
     │  • Edge bonus: +50% si impacto cerca del borde               │
     │  • Estados del stake: face_down → wobbling → half_flip       │
     │    → face_up/secured/captured/out_of_circle                  │
     │  • Score: +1 flip propio, +2 flip rival, +1 doble flip      │
     │  • Partículas de impacto (18 sparks radiales)                │
     │  • Screen shake + impact flash ring                          │
     └─────────────────────────────┬───────────────────────────────┘
                                   │
     ┌─────────────────────────────▼───────────────────────────────┐
     │  RESOLVE — checkMatchEnd()                                   │
     │  • Score popups (+1/+2 float up)                            │
     │  • Primero a 5 puntos gana                                  │
     │  • Si no: turno del oponente → ⬆ vuelve a AIM               │
     │  • Si sí: MATCH END                                          │
     └─────────────────────────────────────────────────────────────┘
```

## Stats del Tazo → Efecto en Batalla

| Stat | Efecto en batalla | Wear penalty max |
|------|-------------------|:---:|
| **ATK** | Fuerza de impacto al golpear staked tazo | -20% |
| **DEF** | Resistencia a ser volteado (si es tu stake) | -18% |
| **RES** | Aguante en el círculo (ring resilience) | — |
| **WT** | Momentum del slam (más masa = más fuerza) | — |
| **STAB** | Anti-wobble (recuperación automática) | -12% |
| **SPIN** | Torque transferido al stake | — |
| **CTRL** | 🎯 Velocidad del reticle en AIM | -8% |
| **PREC** | 🎯 Jitter en AIM + precisión del impacto | -10% |
| **BNC** | Rebote post-impacto | — |

## Sistema de Desgaste (Wear)

| Nivel | Wear | Efecto visual CSS | Penalización stats |
|-------|------|-------------------|:---:|
| **Mint** | 0% | Prístino | 0% |
| **Lightly Played** | 1–15% | Rayones finos, bordes rozados | -2% |
| **Played** | 16–40% | Rayones visibles, bordes gastados | -5% |
| **Heavily Played** | 41–70% | Desconchones, múltiples rayones | -12% |
| **Damaged** | 71–100% | Grietas, peeling, decoloración | -20% |

- Wear incrementa tras cada batalla: +1-3 (victoria) / +2-5 (derrota)
- Aplicado en BD (`UserTazo.wear`) y visible en CSS (`tazo-condition-layer`)
- Badges: LP (Lightly Played), PL (Played), HP (Heavily Played), DM (Damaged)

## Física del Slam

```
impactForce = aimPrecision × verticalForce × timingAccuracy
            × (1 − distance² / distFalloffCap)
            × (1 − wearPenalty)

edgeBonus = distance ≥ 3.8 ? 1.5 : 1.0

scoreImpact:
  own flipped → secured (+1)
  rival flipped → captured (+2)
  double flip → +1 extra bonus
```

- RNG determinista (LCG con seed) para PvP sync futuro
- Gravedad: 22 u/s², fricción de mesa: 0.88
- Tiempo de caída: √(2h / 22) × 1000ms

## Marketplace

| API | Método | Descripción |
|-----|--------|-------------|
| `/api/trade` | GET | Listar tazos en venta (activos) |
| `/api/trade` | POST | Publicar tazo para venta |
| `/api/trade/[id]` | POST | Comprar tazo |
| `/api/trade/[id]` | DELETE | Cancelar venta (devuelve tazo) |

- Precios sugeridos por rarity: Common 5cr, Uncommon 15cr, Rare 40cr, Ultra-Rare 100cr, Legendary 250cr
- Wear descuenta precio: `floor(basePrice × (1 − wear/200))`
- Transferencia atómica: créditos buyer→seller, UserTazo transferido
