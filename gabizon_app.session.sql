-- SELECT c.id as communityID,
--     u.id as userID,
--     u."firstName" as firstName,
--     u."lastName" as lastName,
--     u.notification,
--     p.date
-- FROM "User" u,
--     "Post" p,
--     "Community" c
-- where date(p.date) = CURRENT_DATE
--     and c.id = ANY(u.community_ids)

-- UPDATE "User"
-- SET notification = 'MORNING'
-- WHERE id = 64;

-- UPDATE "User"
-- SET "notiTime" = ARRAY['SUNDAY', 'MINUTES']
-- WHERE id = 67;


-- UPDATE "User"
-- SET email = 'mail@mail.com'
-- WHERE id = 69;

UPDATE "Post"
SET date = CURRENT_DATE + TIME '14:12'
WHERE id = 26;





-- SELECT u.name, l.date, u.email, u.phone, l.title, l.desc, l.id
-- FROM "User" u
-- JOIN "Post" l ON l."communityId" = ANY(u."community_ids")
-- WHERE l.date::date = CURRENT_DATE

-- SELECT u.name, l.date, u.email, u.phone, l.title, l.desc, l.id
-- FROM "User" u
-- JOIN "Post" l ON l."communityId" = ANY(u."community_ids")
-- WHERE l.date::date BETWEEN 
--     (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer)
--     AND 
--     (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer + 5)
-- AND noti @> ARRAY['MORNING']::varchar[]
