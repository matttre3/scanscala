import Link from 'next/link'

export default function BrandLogo() {
  return (
    <Link className="scanscala-admin-logo" href="/admin">
      <span className="scanscala-admin-logo__dot" />
      <span className="scanscala-admin-logo__text">scanscala</span>
    </Link>
  )
}
