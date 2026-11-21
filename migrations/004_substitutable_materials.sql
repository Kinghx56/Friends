-- ============================================================
-- Saarthi — Substitutable Materials Catalog Expansion (2026-11)
-- ============================================================
-- Purpose: Add approved materials so the Equivalence Checker has
-- genuine same-category, same-type candidates to surface as
-- substitutes, instead of returning an empty list.
--
-- Core principle: one CNMC = one unique material specification.
-- Two CNMCs that look similar (e.g. SS304 vs SS316 bolt of the
-- same size) represent genuinely different materials — the
-- Equivalence Checker's job is to decide whether they are
-- interchangeable for a given application.
--
-- Naming convention (identical to schema.sql):
--   CAT  - SUBCAT - TYPE - SPEC          - QUALITY
--   MECH - FSTNR  - BOLT - M8X25-SS316   - A
--
-- Existing CNMCs in schema.sql (DO NOT repeat these):
--   MECH-FSTNR-BOLT-M8X25-SS304-A    MECH-FSTNR-NUT-M8-SS304-A
--   MECH-FSTNR-WSHR-M8-SS304-A       MECH-FSTNR-STUD-M16X50-B7-A
--   MECH-VALVE-BALL-1INPN40-SS316-A  MECH-VALVE-GATE-2INPN16-CS-A
--   MECH-PIPE-PIPE-2INSS-SCH40-A     MECH-PIPE-ELBO-2IN90-SS304-A
--   MECH-PIPE-FLAN-2IN150-SS304-A    MECH-SEAL-GASK-2INRF-GRAP-A
--   MECH-BEAR-BEAR-6205-2RS-A
--   ELEC-CABLE-CABLE-3CX4SQ-XLPE-A   ELEC-CABLE-CTRL-2CX1SQ-PVC-A
--   ELEC-MOTOR-INDU-5HP3P-415V-A     ELEC-INSTR-GAUS-0100P-SS-A
--   CHEM-LUBR-HYDO-VG68-20L-A        CHEM-LUBR-GRES-EP2-1KG-A
--   CONS-PPE-HELM-HDPE-IS2925-A      CONS-PPE-SHOE-STOE-SIZE8-A
--   CONS-PPE-HARN-FULL-ANSIA10-A     CONS-WELD-ELEC-E6013-3M-A
-- ============================================================

INSERT INTO public.materials
  (cnmc, status, category, subcategory, material_type, spec, quality_grade,
   standard_description, short_description, technical_specs, unit_of_measure, created_by)
VALUES

-- ============================================================
-- CLUSTER 1: M8 Bolts — SS304 (existing) ↔ SS316 ↔ longer length
-- Engineer question: "Can I use SS316 instead of SS304 here?"
-- ============================================================

('MECH-FSTNR-BOLT-M8X25-SS316-A', 'approved', 'MECH', 'FSTNR', 'BOLT', 'M8X25-SS316', 'A',
 'Hexagonal Head Bolt M8x25mm Stainless Steel Grade 316 Full Thread ISO 4014',
 'Hex Bolt M8x25 SS316',
 '{"thread_size":"M8","length_mm":25,"material":"SS316","head_type":"hexagonal",
   "thread":"full","standard":"ISO 4014","tensile_strength_mpa":700,
   "note":"SS316 adds Mo for superior chloride corrosion resistance vs SS304"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('MECH-FSTNR-BOLT-M8X30-SS304-A', 'approved', 'MECH', 'FSTNR', 'BOLT', 'M8X30-SS304', 'A',
 'Hexagonal Head Bolt M8x30mm Stainless Steel Grade 304 Full Thread ISO 4014',
 'Hex Bolt M8x30 SS304',
 '{"thread_size":"M8","length_mm":30,"material":"SS304","head_type":"hexagonal",
   "thread":"full","standard":"ISO 4014","tensile_strength_mpa":700}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('MECH-FSTNR-BOLT-M8X25-MS-HDG-A', 'approved', 'MECH', 'FSTNR', 'BOLT', 'M8X25-MS-HDG', 'A',
 'Hexagonal Head Bolt M8x25mm Mild Steel Hot Dip Galvanised Full Thread ISO 4014',
 'Hex Bolt M8x25 MS HDG',
 '{"thread_size":"M8","length_mm":25,"material":"mild_steel","finish":"hot_dip_galvanised",
   "head_type":"hexagonal","thread":"full","standard":"ISO 4014","tensile_strength_mpa":800,
   "note":"Carbon steel; higher strength but lower corrosion resistance than SS304"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

-- ============================================================
-- CLUSTER 2: M8 Nuts — SS304 (existing) ↔ SS316 ↔ MS
-- ============================================================

('MECH-FSTNR-NUT-M8-SS316-A', 'approved', 'MECH', 'FSTNR', 'NUT', 'M8-SS316', 'A',
 'Hexagonal Nut M8 Stainless Steel Grade 316 ISO 4032',
 'Hex Nut M8 SS316',
 '{"thread_size":"M8","material":"SS316","type":"hexagonal","standard":"ISO 4032",
   "note":"Preferred where chloride corrosion is a concern; pairs with SS316 bolts"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('MECH-FSTNR-NUT-M8-MS-HDG-A', 'approved', 'MECH', 'FSTNR', 'NUT', 'M8-MS-HDG', 'A',
 'Hexagonal Nut M8 Mild Steel Hot Dip Galvanised ISO 4032',
 'Hex Nut M8 MS HDG',
 '{"thread_size":"M8","material":"mild_steel","finish":"hot_dip_galvanised",
   "type":"hexagonal","standard":"ISO 4032"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

-- ============================================================
-- CLUSTER 3: M8 Washers — SS304 (existing) ↔ SS316 ↔ spring
-- ============================================================

('MECH-FSTNR-WSHR-M8-SS316-A', 'approved', 'MECH', 'FSTNR', 'WSHR', 'M8-SS316', 'A',
 'Plain Washer M8 Stainless Steel Grade 316 ISO 7089',
 'Plain Washer M8 SS316',
 '{"bore_mm":8,"material":"SS316","type":"plain","standard":"ISO 7089"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('MECH-FSTNR-WSHR-M8-SS304-SPR-A', 'approved', 'MECH', 'FSTNR', 'WSHR', 'M8-SS304-SPR', 'A',
 'Spring Lock Washer M8 Stainless Steel Grade 304 DIN 127B',
 'Spring Washer M8 SS304',
 '{"bore_mm":8,"material":"SS304","type":"spring_lock","standard":"DIN 127B",
   "note":"Prevents loosening under vibration; not interchangeable with plain washer in all applications"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

-- ============================================================
-- CLUSTER 4: 2-Inch SS Pipe — SCH40 TP304 (existing) ↔ SCH80 ↔ TP316
-- ============================================================

('MECH-PIPE-PIPE-2INSS-SCH80-A', 'approved', 'MECH', 'PIPE', 'PIPE', '2INSS-SCH80', 'A',
 'Seamless Stainless Steel Pipe 2 Inch NB Schedule 80 ASTM A312 Grade TP304',
 'SS Pipe 2IN SCH80 TP304',
 '{"nominal_bore_inch":2,"schedule":"80","material":"TP304","standard":"ASTM A312",
   "od_mm":60.3,"wall_thickness_mm":5.54,"pressure_rating_bar":241,
   "temp_range_c":"-20 to +400","pipe_type":"seamless",
   "note":"Heavier wall vs SCH40; same bore; higher pressure rating"}',
 'MTR', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('MECH-PIPE-PIPE-2INSS-SCH40-TP316-A', 'approved', 'MECH', 'PIPE', 'PIPE', '2INSS-SCH40-TP316', 'A',
 'Seamless Stainless Steel Pipe 2 Inch NB Schedule 40 ASTM A312 Grade TP316',
 'SS Pipe 2IN SCH40 TP316',
 '{"nominal_bore_inch":2,"schedule":"40","material":"TP316","standard":"ASTM A312",
   "od_mm":60.3,"wall_thickness_mm":3.91,"pressure_rating_bar":172,
   "temp_range_c":"-20 to +400","pipe_type":"seamless",
   "note":"TP316 grade; superior chloride resistance; same dimensions as TP304 SCH40"}',
 'MTR', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('MECH-PIPE-PIPE-1INSS-SCH40-A', 'approved', 'MECH', 'PIPE', 'PIPE', '1INSS-SCH40', 'A',
 'Seamless Stainless Steel Pipe 1 Inch NB Schedule 40 ASTM A312 Grade TP304',
 'SS Pipe 1IN SCH40 TP304',
 '{"nominal_bore_inch":1,"schedule":"40","material":"TP304","standard":"ASTM A312",
   "od_mm":33.4,"wall_thickness_mm":3.38,"pressure_rating_bar":172,
   "temp_range_c":"-20 to +400","pipe_type":"seamless"}',
 'MTR', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

-- ============================================================
-- CLUSTER 5: 2-Inch 90° Elbows — SS304 (existing) ↔ SS316 ↔ 45°
-- ============================================================

('MECH-PIPE-ELBO-2IN90-SS316-A', 'approved', 'MECH', 'PIPE', 'ELBO', '2IN90-SS316', 'A',
 '90 Degree Elbow 2 Inch NB Stainless Steel Grade 316 Schedule 40 Butt Weld ASME B16.9',
 '90 Deg Elbow 2IN SS316 SCH40',
 '{"nominal_bore_inch":2,"angle_deg":90,"material":"SS316","schedule":"40",
   "end_type":"butt_weld","standard":"ASME B16.9","pressure_rating_bar":69,
   "temp_range_c":"-20 to +400","wall_thickness_mm":3.91}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('MECH-PIPE-ELBO-2IN45-SS304-A', 'approved', 'MECH', 'PIPE', 'ELBO', '2IN45-SS304', 'A',
 '45 Degree Elbow 2 Inch NB Stainless Steel Grade 304 Schedule 40 Butt Weld ASME B16.9',
 '45 Deg Elbow 2IN SS304 SCH40',
 '{"nominal_bore_inch":2,"angle_deg":45,"material":"SS304","schedule":"40",
   "end_type":"butt_weld","standard":"ASME B16.9","pressure_rating_bar":69,
   "temp_range_c":"-20 to +400","wall_thickness_mm":3.91,
   "note":"Different angle — only interchangeable if flow direction change is acceptable"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('MECH-PIPE-TEE-2IN-SS304-A', 'approved', 'MECH', 'PIPE', 'TEE', '2IN-SS304', 'A',
 'Equal Tee 2 Inch NB Stainless Steel Grade 304 Schedule 40 Butt Weld ASME B16.9',
 'Equal Tee 2IN SS304 SCH40',
 '{"nominal_bore_inch":2,"fitting_type":"equal_tee","material":"SS304","schedule":"40",
   "end_type":"butt_weld","standard":"ASME B16.9","pressure_rating_bar":69}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

-- ============================================================
-- CLUSTER 6: Flanges — 2IN ANSI150 SS304 (existing) ↔ SS316 ↔ ANSI300
-- ============================================================

('MECH-PIPE-FLAN-2IN150-SS316-A', 'approved', 'MECH', 'PIPE', 'FLAN', '2IN150-SS316', 'A',
 'Weld Neck Flange 2 Inch ANSI 150 Stainless Steel Grade 316 ASME B16.5',
 'WN Flange 2IN ANSI150 SS316',
 '{"nominal_bore_inch":2,"class":"ANSI 150","material":"SS316","flange_type":"weld_neck",
   "standard":"ASME B16.5","pressure_rating_bar":19.6,"bolt_circle_mm":120.65,
   "num_bolts":8,"raised_face":"yes"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('MECH-PIPE-FLAN-2IN300-SS304-A', 'approved', 'MECH', 'PIPE', 'FLAN', '2IN300-SS304', 'A',
 'Weld Neck Flange 2 Inch ANSI 300 Stainless Steel Grade 304 ASME B16.5',
 'WN Flange 2IN ANSI300 SS304',
 '{"nominal_bore_inch":2,"class":"ANSI 300","material":"SS304","flange_type":"weld_neck",
   "standard":"ASME B16.5","pressure_rating_bar":49.6,"bolt_circle_mm":165.1,
   "num_bolts":8,"raised_face":"yes",
   "note":"ANSI 300 has different bolt circle — not bolt-compatible with ANSI 150"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

-- ============================================================
-- CLUSTER 7: Gaskets — 2IN RF Graphite (existing) ↔ PTFE ↔ SS316 SWG
-- ============================================================

('MECH-SEAL-GASK-2INRF-PTFE-A', 'approved', 'MECH', 'SEAL', 'GASK', '2INRF-PTFE', 'A',
 'Full Face Gasket 2 Inch ANSI 150 PTFE White Sheet 3mm Thick',
 'FF Gasket 2IN ANSI150 PTFE',
 '{"nominal_bore_inch":2,"class":"ANSI 150","material":"PTFE","gasket_type":"full_face",
   "thickness_mm":3,"temp_range_c":"-200 to +260","pressure_rating_bar":16,
   "standard":"ASME B16.21","note":"Suitable for acids/alkalis; lower temp rating than graphite"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('MECH-SEAL-GASK-2INRF-SWG-SS316-A', 'approved', 'MECH', 'SEAL', 'GASK', '2INRF-SWG-SS316', 'A',
 'Spiral Wound Gasket 2 Inch ANSI 150 SS316 Winding Graphite Filler ASME B16.20',
 'SWG 2IN ANSI150 SS316 Graphite',
 '{"nominal_bore_inch":2,"class":"ANSI 150","winding_material":"SS316",
   "filler":"graphite","standard":"ASME B16.20","pressure_rating_bar":19.6,
   "temp_range_c":"-200 to +450","inner_ring":"SS316","outer_ring":"carbon_steel",
   "note":"Higher integrity seal for elevated temp/pressure vs flat sheet gasket"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

-- ============================================================
-- CLUSTER 8: Ball Valves — 1IN PN40 SS316 (existing) ↔ PN16 ↔ SS304
-- ============================================================

('MECH-VALVE-BALL-1INPN16-SS316-A', 'approved', 'MECH', 'VALVE', 'BALL', '1INPN16-SS316', 'A',
 'Ball Valve 1 Inch PN16 Stainless Steel 316 Full Bore Screwed End',
 'Ball Valve 1IN PN16 SS316',
 '{"nominal_bore_inch":1,"pressure_rating":"PN16","body_material":"SS316",
   "bore_type":"full_bore","end_connection":"screwed","actuation":"manual_lever",
   "seating_material":"PTFE","temp_range_c":"-20 to +200","leakage_class":"IV",
   "note":"PN16 rated; lower pressure service only vs PN40"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('MECH-VALVE-BALL-1INPN40-SS304-A', 'approved', 'MECH', 'VALVE', 'BALL', '1INPN40-SS304', 'A',
 'Ball Valve 1 Inch PN40 Stainless Steel 304 Full Bore Screwed End',
 'Ball Valve 1IN PN40 SS304',
 '{"nominal_bore_inch":1,"pressure_rating":"PN40","body_material":"SS304",
   "bore_type":"full_bore","end_connection":"screwed","actuation":"manual_lever",
   "seating_material":"PTFE","temp_range_c":"-20 to +180","leakage_class":"IV",
   "note":"SS304 body; same pressure rating as SS316 version; lower corrosion resistance"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

-- ============================================================
-- CLUSTER 9: Lubricants — VG68 Hydraulic Oil (existing) ↔ VG46 ↔ VG100
--             EP Grease EP2 (existing) ↔ NLGI3 ↔ GP grade
-- ============================================================

('CHEM-LUBR-HYDO-VG46-20L-A', 'approved', 'CHEM', 'LUBR', 'HYDO', 'VG46-20L', 'A',
 'Hydraulic Oil ISO VG 46 HLP Anti-Wear Mineral Base 20 Litre',
 'Hydraulic Oil ISO 46 HLP 20L',
 '{"viscosity_grade":"ISO VG 46","oil_type":"HLP_anti_wear","base":"mineral",
   "viscosity_40c_cst":46,"viscosity_100c_cst":6.8,"viscosity_index":100,
   "pour_point_c":-24,"flash_point_c":210,"pack_size_litres":20,
   "note":"Lighter grade than VG68; suitable for lower temp or smaller pump clearances"}',
 'CAN', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('CHEM-LUBR-HYDO-VG100-20L-A', 'approved', 'CHEM', 'LUBR', 'HYDO', 'VG100-20L', 'A',
 'Hydraulic Oil ISO VG 100 HLP Anti-Wear Mineral Base 20 Litre',
 'Hydraulic Oil ISO 100 HLP 20L',
 '{"viscosity_grade":"ISO VG 100","oil_type":"HLP_anti_wear","base":"mineral",
   "viscosity_40c_cst":100,"viscosity_100c_cst":11.4,"viscosity_index":100,
   "pour_point_c":-18,"flash_point_c":230,"pack_size_litres":20,
   "note":"Heavier grade than VG68; for high-temp or large pump clearances"}',
 'CAN', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('CHEM-LUBR-GRES-EP3-1KG-A', 'approved', 'CHEM', 'LUBR', 'GRES', 'EP3-1KG', 'A',
 'Extreme Pressure Bearing Grease NLGI Grade 3 Lithium Complex 1 Kg',
 'EP Grease NLGI 3 Li-Complex 1Kg',
 '{"nlgi_grade":3,"base_oil":"lithium_complex","base_oil_viscosity_cst":100,
   "ep_additives":"yes","operating_temp_c":"-20 to +160","dropping_point_c":260,
   "pack_size_kg":1,"note":"Stiffer than NLGI 2; preferred for vertical shafts or high vibration"}',
 'KG', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('CHEM-LUBR-GRES-GP2-1KG-A', 'approved', 'CHEM', 'LUBR', 'GRES', 'GP2-1KG', 'A',
 'General Purpose Bearing Grease NLGI Grade 2 Lithium Soap 1 Kg',
 'GP Grease NLGI 2 Lithium 1Kg',
 '{"nlgi_grade":2,"base_oil":"lithium_soap","base_oil_viscosity_cst":68,
   "ep_additives":"no","operating_temp_c":"-20 to +120","dropping_point_c":190,
   "pack_size_kg":1,
   "note":"No EP additives; general purpose only — not for heavy-load or shock-load bearings"}',
 'KG', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

-- ============================================================
-- CLUSTER 10: Cable Ties — CONS category
-- (003 migration seeded CONS-MISC-CTIE-300MM-A as pending — approve it
--  and add siblings for genuine substitute evaluation)
-- ============================================================

('CONS-MISC-CTIE-200MM-BLK-A', 'approved', 'CONS', 'MISC', 'CTIE', '200MM-NYLON-BLK', 'A',
 'Cable Tie Nylon 200mm Black UV Resistant Self-Locking',
 'Cable Tie 200mm Nylon Black UV',
 '{"length_mm":200,"width_mm":4.8,"material":"nylon_66","colour":"black",
   "uv_resistant":"yes","tensile_strength_n":180,"bundle_dia_range_mm":"4-50",
   "operating_temp_c":"-40 to +85","locking":"self_locking_pawl"}',
 'PKT', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('CONS-MISC-CTIE-370MM-SS316-A', 'approved', 'CONS', 'MISC', 'CTIE', '370MM-SS316-BALL', 'A',
 'Cable Tie Stainless Steel 316 370mm Ball Lock High Temperature',
 'Cable Tie 370mm SS316 Ball Lock',
 '{"length_mm":370,"width_mm":7.0,"material":"SS316","colour":"silver",
   "uv_resistant":"yes","tensile_strength_n":750,"bundle_dia_range_mm":"5-100",
   "operating_temp_c":"-80 to +538","locking":"ball_lock",
   "note":"For high-temp or corrosive environments where nylon ties are unsuitable"}',
 'EA', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('CONS-MISC-CTIE-150MM-NAT-A', 'approved', 'CONS', 'MISC', 'CTIE', '150MM-NYLON-NAT', 'A',
 'Cable Tie Nylon 150mm Natural Self-Locking General Purpose',
 'Cable Tie 150mm Nylon Natural',
 '{"length_mm":150,"width_mm":3.6,"material":"nylon_66","colour":"natural",
   "uv_resistant":"no","tensile_strength_n":80,"bundle_dia_range_mm":"2-35",
   "operating_temp_c":"-40 to +70","locking":"self_locking_pawl",
   "note":"Indoor/non-UV applications only"}',
 'PKT', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

-- ============================================================
-- CLUSTER 11: Electrical Cables — 3Cx4sqmm XLPE (existing) ↔ 4-core ↔ PVC
-- ============================================================

('ELEC-CABLE-CABLE-4CX4SQ-XLPE-A', 'approved', 'ELEC', 'CABLE', 'CABLE', '4CX4SQ-XLPE-1100V', 'A',
 '4 Core 4 Sq mm XLPE Insulated PVC Sheathed Armoured Cable 1100V Grade IS 1554',
 '4C 4sqmm XLPE Armoured 1100V',
 '{"cores":4,"conductor_size_sqmm":4.0,"insulation":"XLPE","sheath":"PVC",
   "armour":"galvanised_steel_wire","voltage_grade_v":1100,"standard":"IS 1554",
   "current_rating_a":34,"conductor_material":"stranded_copper","operating_temp_c":90}',
 'MTR', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('ELEC-CABLE-CABLE-3CX2P5SQ-XLPE-A', 'approved', 'ELEC', 'CABLE', 'CABLE', '3CX2P5SQ-XLPE-1100V', 'A',
 '3 Core 2.5 Sq mm XLPE Insulated PVC Sheathed Armoured Cable 1100V Grade IS 1554',
 '3C 2.5sqmm XLPE Armoured 1100V',
 '{"cores":3,"conductor_size_sqmm":2.5,"insulation":"XLPE","sheath":"PVC",
   "armour":"galvanised_steel_wire","voltage_grade_v":1100,"standard":"IS 1554",
   "current_rating_a":26,"conductor_material":"stranded_copper","operating_temp_c":90,
   "note":"3-core vs 4-core; not interchangeable where neutral conductor is required"}',
 'MTR', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('ELEC-CABLE-CABLE-3CX4SQ-PVC-A', 'approved', 'ELEC', 'CABLE', 'CABLE', '3CX4SQ-PVC-1100V', 'A',
 '3 Core 4 Sq mm PVC Insulated PVC Sheathed Armoured Cable 1100V Grade IS 1554',
 '3C 4sqmm PVC Armoured 1100V',
 '{"cores":3,"conductor_size_sqmm":4.0,"insulation":"PVC","sheath":"PVC",
   "armour":"galvanised_steel_wire","voltage_grade_v":1100,"standard":"IS 1554",
   "current_rating_a":30,"conductor_material":"stranded_copper","operating_temp_c":70,
   "note":"PVC insulation; lower temp rating than XLPE; same cores and armour type"}',
 'MTR', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1))

ON CONFLICT (cnmc) DO NOTHING;

-- ============================================================
-- Approve the pending cable tie from migration 003 (if it exists)
-- This is the SAME material, same CNMC — just changing its status.
-- ============================================================
UPDATE public.materials
SET
  status        = 'approved',
  technical_specs = COALESCE(
    NULLIF(technical_specs, '{}'::jsonb),
    '{"length_mm":300,"width_mm":4.8,"material":"nylon_66","colour":"black",
      "uv_resistant":"yes","tensile_strength_n":220,"bundle_dia_range_mm":"4-80",
      "operating_temp_c":"-40 to +85","locking":"self_locking_pawl"}'::jsonb
  )
WHERE cnmc = 'CONS-MISC-CTIE-300MM-A';

-- ============================================================
-- Verification — run after applying and check counts
-- ============================================================
SELECT category, count(*) AS materials_added
FROM public.materials
WHERE cnmc IN (
  'MECH-FSTNR-BOLT-M8X25-SS316-A','MECH-FSTNR-BOLT-M8X30-SS304-A','MECH-FSTNR-BOLT-M8X25-MS-HDG-A',
  'MECH-FSTNR-NUT-M8-SS316-A','MECH-FSTNR-NUT-M8-MS-HDG-A',
  'MECH-FSTNR-WSHR-M8-SS316-A','MECH-FSTNR-WSHR-M8-SS304-SPR-A',
  'MECH-PIPE-PIPE-2INSS-SCH80-A','MECH-PIPE-PIPE-2INSS-SCH40-TP316-A','MECH-PIPE-PIPE-1INSS-SCH40-A',
  'MECH-PIPE-ELBO-2IN90-SS316-A','MECH-PIPE-ELBO-2IN45-SS304-A','MECH-PIPE-TEE-2IN-SS304-A',
  'MECH-PIPE-FLAN-2IN150-SS316-A','MECH-PIPE-FLAN-2IN300-SS304-A',
  'MECH-SEAL-GASK-2INRF-PTFE-A','MECH-SEAL-GASK-2INRF-SWG-SS316-A',
  'MECH-VALVE-BALL-1INPN16-SS316-A','MECH-VALVE-BALL-1INPN40-SS304-A',
  'CHEM-LUBR-HYDO-VG46-20L-A','CHEM-LUBR-HYDO-VG100-20L-A',
  'CHEM-LUBR-GRES-EP3-1KG-A','CHEM-LUBR-GRES-GP2-1KG-A',
  'CONS-MISC-CTIE-200MM-BLK-A','CONS-MISC-CTIE-370MM-SS316-A','CONS-MISC-CTIE-150MM-NAT-A',
  'ELEC-CABLE-CABLE-4CX4SQ-XLPE-A','ELEC-CABLE-CABLE-3CX2P5SQ-XLPE-A','ELEC-CABLE-CABLE-3CX4SQ-PVC-A'
)
GROUP BY category ORDER BY category;

-- Confirm cable tie from 003 is now approved
SELECT cnmc, status, technical_specs IS NOT NULL AS has_specs
FROM public.materials WHERE cnmc = 'CONS-MISC-CTIE-300MM-A';
