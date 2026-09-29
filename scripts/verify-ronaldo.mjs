import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const bytes = await readFile('public/models/ronaldo-portugal.glb');
assert.equal(bytes.toString('ascii', 0, 4), 'glTF');
const gltf = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
assert.equal(gltf.skins[0].joints.length, 24, 'The fitted skeleton must be embedded');
assert.equal(gltf.animations.length, 1);
const clip = gltf.animations[0];
assert.equal(clip.channels.filter(channel => channel.target.path === 'rotation').length, 24);
for (const channel of clip.channels.filter(channel => channel.target.path === 'rotation')) {
 const sampler = clip.samplers[channel.sampler];
 const time = gltf.accessors[sampler.input];
 assert.equal(time.count, 87, 'All captured frames must be retained');
 assert.equal(time.min[0], 0, 'Scroll frame zero must match the first capture frame');
 assert.ok(Math.abs(time.max[0] - 86 / 30) < .00001);
}
const expected = ['Skin Hands', 'Boots', 'Eyelashes', 'Eyes', 'Face', 'Hair', 'Portugal Kit', 'Skin Legs'];
assert.deepEqual(gltf.materials.map(m => m.name).sort(), expected.sort());
for (const material of gltf.materials) assert.ok(material.pbrMetallicRoughness.baseColorTexture, material.name + ' texture missing');
assert.ok(gltf.images.every(image => image.bufferView !== undefined), 'Textures must be embedded');
let vertices = 0;
for (const mesh of gltf.meshes) for (const primitive of mesh.primitives) {
 vertices += gltf.accessors[primitive.attributes.POSITION].count;
 assert.ok(primitive.extensions.KHR_draco_mesh_compression);
 assert.ok(primitive.attributes.JOINTS_0 !== undefined && primitive.attributes.WEIGHTS_0 !== undefined);
}
assert.ok(vertices >= 48000 && vertices < 60000, 'Preserve the character geometry and exclude planar export fragments');
assert.ok(bytes.length < 8 * 1024 * 1024, 'Asset exceeds the web transfer budget');
console.log(JSON.stringify({ passed: true, vertices, joints: 24, frames: 87, materials: 8, bytes: bytes.length }, null, 2));
