import { signIn } from '@/auth';
import { Button } from '@/components/ui/button';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const providerName = process.env.AUTH_OIDC_NAME || 'SSO';

  return (
    <div className='flex flex-col items-center justify-center h-screen gap-6'>
      <img src='/android-chrome-512x512.png' alt='Social to Mealie' width={96} height={96} />
      <h1 className='text-2xl font-bold'>Social to Mealie</h1>
      <form
        action={async () => {
          'use server';
          await signIn('oidc', { redirectTo: callbackUrl || '/' });
        }}
      >
        <Button type='submit' className='w-64'>
          Sign in with {providerName}
        </Button>
      </form>
    </div>
  );
}
