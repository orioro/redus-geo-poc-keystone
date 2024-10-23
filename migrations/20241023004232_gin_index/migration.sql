-- CreateIndex
CREATE INDEX "Json_MapFeature_properties_idx" ON "Json_MapFeature" USING GIN ("properties");
