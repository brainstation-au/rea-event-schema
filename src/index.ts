import { mkdirSync, readdirSync, writeFileSync, rmSync } from 'fs';
import { join, parse } from 'path';
import { ZodObject } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export * from '.';

function *walkSync(dir: string): Generator<string> {
  const files = readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(join(dir, file.name));
    } else {
      yield join(dir, file.name);
    }
  }
}

const generateAWSEventSchema = () => {
  const schemaDir = __dirname.replace(/src$/, 'cloudevent-schema');
  rmSync(schemaDir, { recursive: true });

  for (const zodFile of walkSync(__dirname)) {
    if (!zodFile.startsWith('common/')
      && !(/src\/index\.ts$/g).test(zodFile)
      && (/\/index\.ts$/g).test(zodFile)) {
      const schemaFile = zodFile.replace(__dirname, schemaDir).replace(/\/index\.ts$/g, '.json');
      mkdirSync(parse(schemaFile).dir, { recursive: true });
      import(zodFile)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((zod: {default: ZodObject<any>}) => {
          return zodToJsonSchema(zod.default);
        })
        .then(schema => JSON.stringify(schema, null, 2))
        .then(schema => writeFileSync(schemaFile, schema, {encoding: 'utf-8'}));
    }
  }
};

generateAWSEventSchema();
