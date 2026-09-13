-- Seed academic structure only.
-- Colleges and departments match the project specification.
-- No course codes or titles are invented. Admins add courses later.

insert into public.levels (code, name, sort_order, is_farm_practical)
values
  ('100', '100 Level', 1, false),
  ('200', '200 Level', 2, false),
  ('300', '300 Level', 3, false),
  ('400', '400 Level', 4, true),
  ('500', '500 Level', 5, false)
on conflict (code) do update
  set name = excluded.name,
      sort_order = excluded.sort_order,
      is_farm_practical = excluded.is_farm_practical;

insert into public.semesters (code, name, sort_order)
values
  ('first', 'First Semester', 1),
  ('second', 'Second Semester', 2)
on conflict (code) do update
  set name = excluded.name,
      sort_order = excluded.sort_order;

insert into public.colleges (code, name, full_name, description, sort_order)
values
  (
    'COLPLANT',
    'COLPLANT',
    'College of Plant Science and Crop Production',
    'Browse departments and non-major course materials in plant science and crop production.',
    1
  ),
  (
    'COLANIM',
    'COLANIM',
    'College of Animal Science and Livestock Production',
    'Browse departments and non-major course materials in animal science and livestock production.',
    2
  ),
  (
    'COLAMRUD',
    'COLAMRUD',
    'College of Agricultural Management and Rural Development',
    'Browse departments and non-major course materials in agricultural management and rural development.',
    3
  )
on conflict (code) do update
  set name = excluded.name,
      full_name = excluded.full_name,
      description = excluded.description,
      sort_order = excluded.sort_order,
      is_active = true;

insert into public.departments (college_id, code, name, full_name, sort_order)
select c.id, d.code, d.name, d.full_name, d.sort_order
from public.colleges c
join (
  values
    ('COLPLANT', 'CPT', 'Crop Protection', 'Crop Protection', 1),
    ('COLPLANT', 'HRT', 'Horticulture', 'Horticulture', 2),
    ('COLPLANT', 'PBST', 'Plant Breeding and Seed Technology', 'Plant Breeding and Seed Technology', 3),
    ('COLPLANT', 'PPCP', 'Plant Physiology and Crop Production', 'Plant Physiology and Crop Production', 4),
    ('COLPLANT', 'SSLM', 'Soil Science and Land Management', 'Soil Science and Land Management', 5),
    ('COLANIM', 'ABG', 'Animal Breeding and Genetics', 'Animal Breeding and Genetics', 1),
    ('COLANIM', 'ANN', 'Animal Nutrition', 'Animal Nutrition', 2),
    ('COLANIM', 'ANP', 'Animal Physiology', 'Animal Physiology', 3),
    ('COLANIM', 'APH', 'Animal Production and Health', 'Animal Production and Health', 4),
    ('COLANIM', 'PRM', 'Pasture and Range Management', 'Pasture and Range Management', 5),
    ('COLAMRUD', 'AEFM', 'Agricultural Economics and Farm Management', 'Agricultural Economics and Farm Management', 1),
    ('COLAMRUD', 'AERD', 'Agricultural Extension and Rural Development', 'Agricultural Extension and Rural Development', 2),
    ('COLAMRUD', 'AGAD', 'Agricultural Administration', 'Agricultural Administration', 3),
    ('COLAMRUD', 'CGNS', 'Communication and General Studies', 'Communication and General Studies', 4)
) as d(college_code, code, name, full_name, sort_order)
  on d.college_code = c.code
on conflict (college_id, code) do update
  set name = excluded.name,
      full_name = excluded.full_name,
      sort_order = excluded.sort_order,
      is_active = true;

insert into public.platform_settings (
  id,
  platform_name,
  platform_description,
  contact_email,
  maintenance_mode
)
values (
  1,
  'FUNAAB Agric Student',
  'A student academic resource platform for FUNAAB non-major course materials. This is not an official university portal.',
  'support@example.com',
  false
)
on conflict (id) do update
  set platform_name = excluded.platform_name,
      platform_description = excluded.platform_description;
