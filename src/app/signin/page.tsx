import { signIn } from '@/auth';
import { Button } from '@/components/ui/button';

const errorMessages: Record<string, string> = {
  NoHousehold:
    'Your account is not linked to a Mealie household. Ask the administrator to add your email to Mealie.',
  EmailNotVerified:
    'Your email address has not been verified by the login provider.',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const providerName = process.env.AUTH_OIDC_NAME || 'SSO';
  const errorMessage = error
    ? errorMessages[error] || 'Sign-in failed. Please try again.'
    : null;

  return (
    <div className='flex flex-col items-center justify-center h-screen gap-6'>
      <img src='/android-chrome-512x512.png' alt='Social to Mealie' width={96} height={96} />
      <h1 className='text-2xl font-bold'>Social to Mealie</h1>
      {errorMessage && (
        <p
          role='alert'
          className='max-w-sm text-center text-sm text-red-600 border border-red-300 rounded-md px-4 py-2'
        >
          {errorMessage}
        </p>
      )}
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
