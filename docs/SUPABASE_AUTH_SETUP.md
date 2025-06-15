# Supabase Authentication Setup

This guide explains how to add login functionality and manage users with Supabase.

## 1. Create a Supabase project

1. Sign in at <https://supabase.com> and create a new project.
2. Choose a project name, password, and region.
3. Wait for initialization to complete.

## 2. Grab API credentials

1. Open **Settings > API** in your project dashboard.
2. Copy the **Project URL** and **anon public** API key.
3. Create a `.env` file from `.env.example` and update the values:

```bash
VITE_SUPABASE_URL=<your project url>
VITE_SUPABASE_KEY=<your anon key>
```

## 3. Set up the database

1. In **Table Editor**, create a table named `items` (if it does not already exist) with fields like `id`, `name`, `price`, `details`, `image_url`, `status`, and `date_added`.
2. Enable Row Level Security if you plan to restrict items to the logged in user. Add a `user_id` column and create policies to match `auth.uid()`.

## 4. Enable authentication

1. Go to **Auth > Settings** and enable email/password sign in. Enable other providers as needed.
2. Accounts created through your app will appear under **Auth > Users**.

> **Note**
> Your Supabase dashboard login is only for administering the project. Users who register in your app are separate and managed under the **Users** tab.

## 5. Integrate login in the app

Use `supabase.auth.signUp` and `supabase.auth.signInWithPassword` from `@supabase/supabase-js`.
A minimal example:

```ts
import { supabase } from '@/supabaseClient';

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
```

Listen for changes with `supabase.auth.onAuthStateChange` and show your item tracker only when a user is logged in.

## 6. Startup screen and main page loading

`AppRoot.vue` shows a landing animation for five seconds before rendering the main app. After the animation, check whether a user session exists:

```ts
import { supabase } from '@/supabaseClient';
import LoginForm from '@/components/LoginForm.vue';

const loggedIn = ref(false);

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  loggedIn.value = !!data.session;
});

supabase.auth.onAuthStateChange((_event, session) => {
  loggedIn.value = !!session;
});
```

When `loggedIn` is `false`, display `<LoginForm />` instead of the item tracker. Once the user logs in, the main page loads normally.

## 7. Reverting if something goes wrong

Before making substantial changes, commit your code:

```bash
git add .
git commit -m "before-auth"
```

If you need to return to the previous state later, run:

```bash
git reset --hard HEAD~1
```

or checkout a specific commit hash from `git log`.

## 8. User-specific items and images

To keep each user's data separate, add a `user_id` column to your `items`
table and set up Row Level Security policies that compare `user_id` to
`auth.uid()`. When inserting an item from the app, include the current user's
ID and filter queries by that field:

```ts
const user = supabase.auth.currentUser;
await supabase.from('items').insert({
  user_id: user?.id,
  name: newItem.name,
  // ...other fields
});

const { data } = await supabase
  .from('items')
  .select('*')
  .eq('user_id', user?.id);
```

When uploading pictures, save them under a folder named after the user ID so
files remain private:

```ts
const filePath = `${user?.id}/${fileName}`;
await supabase.storage.from('images').upload(filePath, file);
```

Create storage policies that allow access only to files where the path starts
with the authenticated user's ID.

## 9. Where is user data stored?

When you enable Supabase Auth, it automatically creates an `auth` schema with a
`users` table. Every time someone signs up through your app using
`supabase.auth.signUp`, a row is added to `auth.users`. You generally do not need
to create your own users table. Manage accounts from the **Auth > Users** section
of the Supabase dashboard.

If you want additional profile data, create a separate `profiles` table that
references the user's ID and join it in your queries.
