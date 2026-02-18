export const formatDateFR = (value) => {
  if (!value) return ''
  // Parse plain YYYY-MM-DD as local date to avoid timezone shift to previous day.
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  const date = isDateOnly
    ? new Date(
        Number(value.slice(0, 4)),
        Number(value.slice(5, 7)) - 1,
        Number(value.slice(8, 10))
      )
    : new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR')
}
