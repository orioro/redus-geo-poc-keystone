-- create postgis extension
CREATE EXTENSION postgis;

-- CreateTable
CREATE TABLE "KeyValue_MapLayer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" JSONB,
    "featurePropertySchema" JSONB,
    "parentMapLayer" UUID,

    CONSTRAINT "KeyValue_MapLayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyValue_MapFeature" (
    "id" UUID NOT NULL,
    "mapLayer" UUID,
    "name" TEXT NOT NULL DEFAULT '',
    "geometry_geometry" GEOMETRY(Geometry, 4326),
    "geometry_geoJson" JSONB,
    "properties" JSONB,

    CONSTRAINT "KeyValue_MapFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyValue_MapFeatureProperty" (
    "id" UUID NOT NULL,
    "mapFeature" UUID,
    "key" TEXT NOT NULL DEFAULT '',
    "type" TEXT,
    "value_text" TEXT NOT NULL DEFAULT '',
    "value_number" DOUBLE PRECISION,

    CONSTRAINT "KeyValue_MapFeatureProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Json_MapLayer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" JSONB,
    "featurePropertySchema" JSONB,
    "parentMapLayer" UUID,

    CONSTRAINT "Json_MapLayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Json_MapFeature" (
    "id" UUID NOT NULL,
    "mapLayer" UUID,
    "name" TEXT NOT NULL DEFAULT '',
    "geometry_geometry" GEOMETRY(Geometry, 4326),
    "geometry_geoJson" JSONB,
    "properties" JSONB,

    CONSTRAINT "Json_MapFeature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KeyValue_MapLayer_parentMapLayer_idx" ON "KeyValue_MapLayer"("parentMapLayer");

-- CreateIndex
CREATE INDEX "KeyValue_MapFeature_mapLayer_idx" ON "KeyValue_MapFeature"("mapLayer");

-- CreateIndex
CREATE INDEX "KeyValue_MapFeature_geometry_geometry_idx" ON "KeyValue_MapFeature" USING GIST ("geometry_geometry");

-- CreateIndex
CREATE INDEX "KeyValue_MapFeatureProperty_mapFeature_idx" ON "KeyValue_MapFeatureProperty"("mapFeature");

-- CreateIndex
CREATE INDEX "Json_MapLayer_parentMapLayer_idx" ON "Json_MapLayer"("parentMapLayer");

-- CreateIndex
CREATE INDEX "Json_MapFeature_mapLayer_idx" ON "Json_MapFeature"("mapLayer");

-- CreateIndex
CREATE INDEX "Json_MapFeature_geometry_geometry_idx" ON "Json_MapFeature" USING GIST ("geometry_geometry");

-- AddForeignKey
ALTER TABLE "KeyValue_MapLayer" ADD CONSTRAINT "KeyValue_MapLayer_parentMapLayer_fkey" FOREIGN KEY ("parentMapLayer") REFERENCES "KeyValue_MapLayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyValue_MapFeature" ADD CONSTRAINT "KeyValue_MapFeature_mapLayer_fkey" FOREIGN KEY ("mapLayer") REFERENCES "KeyValue_MapLayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyValue_MapFeatureProperty" ADD CONSTRAINT "KeyValue_MapFeatureProperty_mapFeature_fkey" FOREIGN KEY ("mapFeature") REFERENCES "KeyValue_MapFeature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Json_MapLayer" ADD CONSTRAINT "Json_MapLayer_parentMapLayer_fkey" FOREIGN KEY ("parentMapLayer") REFERENCES "Json_MapLayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Json_MapFeature" ADD CONSTRAINT "Json_MapFeature_mapLayer_fkey" FOREIGN KEY ("mapLayer") REFERENCES "Json_MapLayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
