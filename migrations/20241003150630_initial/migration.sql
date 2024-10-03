-- create postgis extension
CREATE EXTENSION postgis;

-- CreateTable
CREATE TABLE "MapLayer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" JSONB,
    "featurePropertySchema" JSONB,
    "parentMapLayer" UUID,

    CONSTRAINT "MapLayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapFeature" (
    "id" UUID NOT NULL,
    "mapLayer" UUID,
    "name" TEXT NOT NULL DEFAULT '',
    "geometry" geometry,

    CONSTRAINT "MapFeature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MapLayer_parentMapLayer_idx" ON "MapLayer"("parentMapLayer");

-- CreateIndex
CREATE INDEX "MapFeature_mapLayer_idx" ON "MapFeature"("mapLayer");

-- AddForeignKey
ALTER TABLE "MapLayer" ADD CONSTRAINT "MapLayer_parentMapLayer_fkey" FOREIGN KEY ("parentMapLayer") REFERENCES "MapLayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapFeature" ADD CONSTRAINT "MapFeature_mapLayer_fkey" FOREIGN KEY ("mapLayer") REFERENCES "MapLayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
