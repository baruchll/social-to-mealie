import { RecipeFetcher } from '@/components/recipe-fetcher';
import GetTagSelect from '../components/tag-select/tag-fetch';
import {Suspense} from "react";
import {Spinner} from "@/components/ui/spinner";
import { Button } from '@/components/ui/button';
import { auth, authEnabled, signOut } from '@/auth';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const tagQuery = sp.tagQuery as string | undefined;
  const tags = (sp.tags as string)?.split(',').filter(Boolean) ?? [];
  const session = authEnabled ? await auth() : null;

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      {session?.user && (
        <form
          className='absolute top-4 right-4 flex items-center gap-3 text-sm'
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <span>{session.user.name ?? session.user.email}</span>
          <Button type='submit' variant='outline' size='sm'>
            Sign out
          </Button>
        </form>
      )}
      <h1 className='text-3xl font-bold'>Welcome to social to Mealie</h1>
        <Suspense fallback={<Spinner />}>
      <RecipeFetcher tags={tags} />
        </Suspense>
      <div className='w-fit min-w-96 m-4'>
        <GetTagSelect query={tagQuery} />
      </div>
    </div>
  );
}
