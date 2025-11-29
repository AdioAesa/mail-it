import { forwardRef } from 'react'

/**
 * Button component with vintage postal aesthetic
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} props.variant - Button style variant
 * @param {'sm'|'md'|'lg'} props.size - Button size
 * @param {boolean} props.loading - Show loading state
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.fullWidth - Full width button
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const baseStyles = `
    inline-flex items-center justify-center font-sans font-medium
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-paper-aged
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    relative overflow-hidden
  `

  const variants = {
    primary: `
      bg-gradient-to-br from-burgundy-600 to-burgundy-700
      text-cream-50
      hover:from-burgundy-700 hover:to-burgundy-800
      focus:ring-burgundy-400
      shadow-md hover:shadow-lg
      active:scale-[0.98]
      border border-burgundy-700
    `,
    secondary: `
      bg-gradient-to-br from-postal-500 to-postal-600
      text-cream-50
      hover:from-postal-600 hover:to-postal-700
      focus:ring-postal-400
      shadow-md hover:shadow-lg
      active:scale-[0.98]
      border border-postal-600
    `,
    outline: `
      bg-transparent
      text-burgundy-700
      border-2 border-burgundy-300
      hover:bg-burgundy-50 hover:border-burgundy-400
      focus:ring-burgundy-300
      active:scale-[0.98]
    `,
    ghost: `
      bg-transparent
      text-ink-medium
      hover:bg-cream-200 hover:text-ink-dark
      focus:ring-ink-faded
      border border-transparent
    `,
    danger: `
      bg-gradient-to-br from-red-500 to-red-600
      text-white
      hover:from-red-600 hover:to-red-700
      focus:ring-red-400
      shadow-md hover:shadow-lg
      active:scale-[0.98]
      border border-red-600
    `,
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-5 py-2.5 text-base rounded-md',
    lg: 'px-7 py-3.5 text-lg rounded-lg tracking-wide',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {/* Subtle shine effect */}
      <span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                   translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
        aria-hidden="true"
      />

      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
})

Button.displayName = 'Button'

export default Button
