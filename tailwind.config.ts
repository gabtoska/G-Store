import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        cloud: "#f7f3ec",
        accent: "#0f5a45",
        brass: "#b9894e",
        coral: "#f25d4f"
      },
      fontFamily: {
        sans: ["var(--font-satoshi)", "ui-sans-serif", "sans-serif"],
        display: ["var(--font-clash)", "ui-serif", "serif"]
      },
      boxShadow: {
        float: "0 20px 60px rgba(21, 21, 21, 0.15)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at 30% 20%, rgba(242,93,79,0.32), transparent 40%), radial-gradient(circle at 80% 0%, rgba(15,90,69,0.22), transparent 46%), radial-gradient(circle at 20% 80%, rgba(185,137,78,0.22), transparent 45%)"
      },
      animation: {
        reveal: "reveal 700ms ease-out both",
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 5s linear infinite"
      },
      keyframes: {
        reveal: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" }
        }
      }
    }
  },
  plugins: []
};

export default config;
