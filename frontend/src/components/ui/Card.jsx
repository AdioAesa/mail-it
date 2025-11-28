/**
 * Card component - reusable container with shadow and padding
 * @param {Object} props
 * @param {boolean} props.hover - Add hover effect
 * @param {boolean} props.clickable - Make card clickable (adds cursor pointer)
 * @param {string} props.padding - Padding size (sm, md, lg, none)
 */
const Card = ({
  children,
  hover = false,
  clickable = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-soft'
  const hoverStyles = hover ? 'hover:shadow-soft-lg transition-shadow duration-200' : ''
  const clickableStyles = clickable ? 'cursor-pointer' : ''

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
