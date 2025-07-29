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
VITE_HCAPTCHA_SITEKEY=<your hCaptcha site key>
```

## 3. Set up the database

1. In **Table Editor**, create a table named `items` (if it does not already exist) with fields like `id`, `name`, `price`, `details`, `image_url`, `status`, and `date_added`.
2. Enable Row Level Security if you plan to restrict items to the logged in user. Add a `user_id` column and create policies to match `auth.uid()`.

## 4. Enable authentication

1. Go to **Auth > Settings** and enable email/password sign in. Enable other providers as needed.
2. Accounts created through your app will appear under **Auth > Users**.
3. Under **Settings → Authentication → Bot and Abuse Protection**, toggle **Enable CAPTCHA protection**, choose **hCaptcha**, and enter your secret key.

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

`AppRoot.vue` displays a landing page with a looping 3D logo. A small debug overlay indicates whether the animation is playing and if its texture loaded. The main app only loads once visitors choose to **Login** or **Sign Up**. When they leave the landing page, check whether a user session exists:


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
const { data: userData } = await supabase.auth.getUser();
const user = userData.user;
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

## 10. Updating an existing project for per‑user items

If you already have a Supabase project from earlier versions of the app,
follow these steps before running the updated code:

1. **Add a `user_id` column** to the `items` table. Use the `uuid` type and
   allow `null` while you migrate existing data. This column should store the
   ID from `auth.users` (also known as the user's UID). You may optionally set
   the default value to `auth.uid()`.
2. **Enable Row Level Security** and create policies for `select`, `insert`,
   `update` and `delete` that check `user_id = auth.uid()` so each user only
   accesses their own records.
3. **Assign a user ID to existing rows** or remove them. Example SQL to attach
   all current items to your user account:

   ```sql
   update items set user_id = '<your-user-id>' where user_id is null;
   ```
4. **Verify the `images` and `stats` buckets** exist. Add a policy allowing
   access only when the path starts with the authenticated user's ID. Uploaded
   images and generated stats will be saved under
   `images/<userId>/...` and `stats/<userId>/current-stats.json` respectively.

After completing these steps the application will correctly save and display
items on a per-user basis.

## 11. SQL setup script

For a fresh project you can simply run the SQL from
[SUPABASE_SETUP.sql](SUPABASE_SETUP.sql) using Supabase's SQL Editor. This
creates the `items` table, enables Row Level Security with policies, and sets up
`images` and `stats` storage buckets restricted to each user's folder.
