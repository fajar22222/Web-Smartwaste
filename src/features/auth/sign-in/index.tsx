import { Link, useSearch } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <div className='mx-auto w-full max-w-md space-y-6'>
        {/* Identitas SmartWaste */}
        <div className='flex flex-col items-center gap-3 text-center'>
          {/* <div className='flex size-16 items-center justify-center overflow-hidden rounded-2xl border bg-background p-2 shadow-sm'>
            <img
              src='/logo22.png'
              alt='Logo SmartWaste'
              className='h-20 w-20 object-contain'
            />
            <Leaf className='absolute -z-10 size-8 text-green-600' />
          </div> */}

          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>SmartWaste</h1>
            {/* <p className='text-sm text-muted-foreground'>
              Bersama wujudkan lingkungan yang lebih bersih
            </p> */}
          </div>
        </div>

        {/* Form login */}
        <Card className='gap-5 border-border/70 shadow-lg shadow-black/5'>
          <CardHeader className='space-y-2'>
            {/* <div className='mb-1 flex size-10 items-center justify-center rounded-xl bg-green-600/10 text-green-700 dark:text-green-400'>
              <LogIn className='size-5' />
            </div> */}

            <CardTitle className='text-center text-xl tracking-tight'>
              Login
            </CardTitle>

            <CardDescription className='leading-relaxed'></CardDescription>
          </CardHeader>

          <CardContent>
            <UserAuthForm redirectTo={redirect} />
          </CardContent>

          <CardFooter className='flex-col gap-4 border-t pt-5'>
            <p className='text-center text-sm text-muted-foreground'>
              Belum memiliki akun?{' '}
              <Link
                to='/sign-up'
                className='font-semibold text-green-700 underline-offset-4 hover:underline dark:text-green-400'
              >
                Daftar sekarang
                <ArrowRight className='ml-1 inline size-3.5' />
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Informasi aplikasi */}
        {/* <p className='px-4 text-center text-xs leading-relaxed text-muted-foreground'>
          SmartWaste · Mendukung SDG 11: Kota dan Permukiman yang Berkelanjutan
        </p> */}
      </div>
    </AuthLayout>
  )
}
