/*
  Warnings:

  - You are about to drop the column `geometry` on the `MapFeature` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MapFeature" DROP COLUMN "geometry",
ADD COLUMN     "geometry_geometry" geometry,
ADD COLUMN     "geometry_json" JSONB;
