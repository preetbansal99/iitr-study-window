# Step 7: RLS Policies for Identity Lock (DO NOT APPLY YET)

> ⚠️ **WARNING**: These policies should only be applied AFTER:
> 1. All existing users have been migrated
> 2. The identity flow has been tested in production
> 3. A rollback plan is in place

## Policy 1: Prevent Identity Field Updates After Lock

This policy prevents users from modifying identity fields once `identity_locked = true`.

```sql
-- Drop existing update policy first (if any)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create new policy that protects identity fields
CREATE POLICY "Users can update own profile with identity protection"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  -- Allow all updates if identity is not locked yet
  -- OR if locked, only allow non-identity field changes
  identity_locked = false
  OR (
    -- These fields must NOT change if locked
    enrollment_number IS NOT DISTINCT FROM (SELECT enrollment_number FROM public.users WHERE id = auth.uid())
    AND enrollment_year IS NOT DISTINCT FROM (SELECT enrollment_year FROM public.users WHERE id = auth.uid())
    AND branch_code IS NOT DISTINCT FROM (SELECT branch_code FROM public.users WHERE id = auth.uid())
    AND branch_name IS NOT DISTINCT FROM (SELECT branch_name FROM public.users WHERE id = auth.uid())
    AND roll_number IS NOT DISTINCT FROM (SELECT roll_number FROM public.users WHERE id = auth.uid())
    AND current_academic_year IS NOT DISTINCT FROM (SELECT current_academic_year FROM public.users WHERE id = auth.uid())
    AND current_semester IS NOT DISTINCT FROM (SELECT current_semester FROM public.users WHERE id = auth.uid())
    AND full_name IS NOT DISTINCT FROM (SELECT full_name FROM public.users WHERE id = auth.uid())
  )
);
```

## Policy 2: Admin Override

This policy allows admins to modify any user's profile (for support cases).

```sql
CREATE POLICY "Admins can update any profile"
ON public.users
FOR UPDATE
USING (
  -- Check if current user is admin
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

## When to Enable

1. **Test thoroughly** in staging first
2. **Verify** that all new users can complete identity setup
3. **Confirm** existing users are unaffected
4. **Apply** during a maintenance window
5. **Monitor** for any UPDATE failures

## Rollback

If issues occur, immediately run:

```sql
DROP POLICY IF EXISTS "Users can update own profile with identity protection" ON public.users;

-- Restore simple policy
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);
```
