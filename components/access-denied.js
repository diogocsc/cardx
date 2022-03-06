import { signIn } from 'next-auth/client'
import Link from 'next/link'


export default function AccessDenied () {
  return (
    <>
      <h1>Access Denied</h1>
      <p>
      <Link href="/api/auth/login">
        <a>Login</a>
      </Link>
      </p>
    </>
  )
}
