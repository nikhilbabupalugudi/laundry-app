alter table public.orders
  add column if not exists mobile_number text;

update public.orders
set mobile_number = regexp_replace(mobile_number, '\D', '', 'g')
where mobile_number is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_mobile_number_format_check'
  ) then
    alter table public.orders
      add constraint orders_mobile_number_format_check
      check (
        mobile_number is null
        or mobile_number ~ '^[0-9]{10,15}$'
      );
  end if;
end $$;

create index if not exists orders_mobile_number_idx
  on public.orders (mobile_number);

comment on column public.orders.mobile_number is
  'Customer mobile number used for order tracking.';

-- After backfilling any legacy rows without a mobile number, you can enforce
-- database-level required values with:
-- alter table public.orders alter column mobile_number set not null;
