import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Buat Akun</CardTitle>
        </CardHeader>

        <CardContent>
          <SignUpForm />
        </CardContent>

        <CardFooter>
          <p className='px-8 text-center text-sm text-muted-foreground'>
            Dengan membuat akun, Anda dapat menggunakan layanan pelaporan sampah
            SmartWaste.
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
