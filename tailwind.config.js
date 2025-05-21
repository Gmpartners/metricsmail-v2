import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  // Ativando o Just-In-Time mode para melhor performance
  mode: 'jit',
  // Safelist otimizada - apenas classes essenciais
  safelist: [
    // Classes fundamentais que podem ser geradas dinamicamente
    {
      pattern: /^(bg|text|border)-(orange|amber|yellow)-(400|500|600)$/,
      variants: ['hover', 'focus', 'active']
    },
    {
      pattern: /^animate-(float|pulse|fadeInUp|spin)$/
    },
    {
      pattern: /^(stagger-item|glass-panel|card-modern|button-modern)$/,
      variants: ['hover', 'focus']
    }
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      colors: {
        // Core theme colors
        'bg-dark': {
          primary: '#121212',
          secondary: '#1a1a1a',
          tertiary: '#222222',
        },
        'card': {
          DEFAULT: '#282828',
          hover: '#333333',
        },
        
        // Firebase theme
        firebase: {
          orange: '#FF9800',
          'orange-dark': '#F57C00',
          'orange-light': '#FFB74D',
          'orange-faded': 'rgba(255, 152, 0, 0.15)',
        },
        
        // Tremor colors
        tremor: {
          brand: {
            faint: colors.blue[50],
            muted: colors.blue[200],
            subtle: colors.blue[400],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[700],
            inverted: colors.white,
          },
          content: {
            subtle: colors.gray[400],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[700],
            strong: colors.gray[900],
            inverted: colors.white,
          },
        },
        'dark-tremor': {
          brand: {
            faint: '#0B1229',
            muted: colors.blue[950],
            subtle: colors.blue[800],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[400],
            inverted: colors.blue[950],
          },
          border: {
            DEFAULT: colors.gray[800],
          },
          ring: {
            DEFAULT: colors.gray[800],
          },
          content: {
            subtle: colors.gray[600],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[200],
            strong: colors.gray[50],
            inverted: colors.gray[950],
          },
        },
        
        // shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'tremor-small': '0.375rem',
        'tremor-default': '0.5rem',
        'tremor-full': '9999px',
      },
      boxShadow: {
        // Tremor shadows
        'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'dark-tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'dark-tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        
        // Custom theme shadows
        'glow-orange': '0 0 15px rgba(255, 152, 0, 0.25)',
        'glow-orange-lg': '0 0 30px rgba(255, 152, 0, 0.4)',
        'card-modern': '0 4px 12px rgba(0, 0, 0, 0.2)',
        'card-modern-hover': '0 8px 20px rgba(0, 0, 0, 0.25), 0 0 15px rgba(255, 152, 0, 0.25)',
      },
      fontSize: {
        'tremor-label': ['0.75rem', { lineHeight: '1rem' }],
        'tremor-default': ['0.875rem', { lineHeight: '1.25rem' }],
        'tremor-title': ['1.125rem', { lineHeight: '1.75rem' }],
        'tremor-metric': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      keyframes: {
        // Base keyframes - essenciais
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        
        // Animations otimizadas
        "fadeIn": {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        "fadeInUp": {
          '0%': { opacity: '0', transform: 'translate3d(0, 20px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        "fadeInDown": {
          '0%': { opacity: '0', transform: 'translate3d(0, -20px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        "shimmer": {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        "float": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        "pulse-glow": {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 152, 0, 0.3)' },
          '50%': { boxShadow: '0 0 15px rgba(255, 152, 0, 0.6)' },
        },
        "scale-in": {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        "slide-in-left": {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        "slide-in-right": {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      },
      animation: {
        // Animações base
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        
        // Animações otimizadas
        "fadeIn": 'fadeIn 0.6s ease-out forwards',
        "fadeInUp": 'fadeInUp 0.6s ease-out forwards',
        "fadeInDown": 'fadeInDown 0.6s ease-out forwards',
        "shimmer": 'shimmer 2s linear infinite',
        "float": 'float 5s ease-in-out infinite',
        "pulse-glow": 'pulse-glow 2s ease-in-out infinite',
        "scale-in": 'scale-in 0.4s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards',
        "slide-in-left": 'slide-in-left 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        "slide-in-right": 'slide-in-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionProperty: {
        'width': 'width',
        'spacing': 'margin, padding',
      },
    },
  },
  future: {
    // Recursos futuros do Tailwind para melhor otimização
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
    hoverOnlyWhenSupported: true,
  },
  plugins: [
    require("tailwindcss-animate"),
    // Plugin otimizado - apenas utilitários essenciais
    function({ addBase, addUtilities, addComponents }) {
      // Base styles para prevenir FOUC
      addBase({
        'html': {
          'background-color': '#121212',
          'color': '#ffffff',
        },
        'body': {
          'background-color': '#121212',
          'color': '#ffffff',
          'font-family': 'var(--font-primary)',
        }
      });
      
      // Componentes essenciais
      addComponents({
        '.card-modern': {
          'background': '#282828',
          'border-radius': '0.5rem',
          'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.2)',
          'transition': 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          'border': '1px solid rgba(255, 255, 255, 0.06)',
          'overflow': 'hidden',
        },
        '.card-modern:hover': {
          'transform': 'translateY(-4px)',
          'box-shadow': '0 8px 20px rgba(0, 0, 0, 0.25), 0 0 15px rgba(255, 152, 0, 0.25)',
          'border-color': 'rgba(255, 152, 0, 0.3)',
        },
        '.button-modern': {
          'background': 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
          'border': 'none',
          'border-radius': '0.375rem',
          'color': 'white',
          'font-weight': '500',
          'padding': '0.625rem 1.25rem',
          'cursor': 'pointer',
          'transition': 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.15)',
        },
        '.glass-panel': {
          'background': 'rgba(40, 40, 40, 0.8)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.08)',
          'border-radius': '0.5rem',
        },
      });
      
      // Utilitários específicos
      addUtilities({
        '.bg-gradient-firebase': {
          'background-image': 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
        },
        '.text-gradient-firebase': {
          'background': 'linear-gradient(90deg, #FF9800, #F57C00)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          'color': 'transparent',
        },
        '.shadow-glow-orange': {
          'box-shadow': '0 0 15px rgba(255, 152, 0, 0.25)',
        },
        '.skeleton': {
          'background': 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%)',
          'background-size': '200% 100%',
          'animation': 'shimmer 1.5s infinite',
          'border-radius': '0.375rem',
        },
      });
    },
  ],
  // Otimizações de build
  corePlugins: {
    // Desabilita plugins não utilizados para reduzir tamanho
    preflight: true, // Mantém o reset CSS
  },
};