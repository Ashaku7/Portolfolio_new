import bpy, math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'artifacts/ronaldo-rigged.blend'))
rig=bpy.data.objects['RonaldoRig'];mesh=bpy.data.objects['Ronaldo']
with bpy.data.libraries.load(str(root/'artifacts/ronaldo-working.blend'),link=False) as (source,target):
 target.materials=source.materials
material=target.materials[0]
mesh.data.materials.clear();mesh.data.materials.append(material)
for node in material.node_tree.nodes:
 if node.type=='TEX_IMAGE' and node.image:
  img=node.image
  limit=4096 if 'basecolor' in img.name else 2048
  if img.size[0]>limit:img.scale(limit,round(img.size[1]*limit/img.size[0]))
 if node.type=='BSDF_PRINCIPLED':
  for socket in ['Metallic','Roughness']:
   for link in list(node.inputs[socket].links):material.node_tree.links.remove(link)
  node.inputs['Metallic'].default_value=0
  node.inputs['Roughness'].default_value=.72
 if node.type=='NORMAL_MAP':node.inputs['Strength'].default_value=.65
scene=bpy.context.scene;scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);rig.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(root/'public/models/ronaldo-cinematic.glb'),export_format='GLB',use_selection=True,export_animations=True,export_frame_range=True,export_force_sampling=True,export_animation_mode='ACTIVE_ACTIONS',export_image_format='JPEG',export_jpeg_quality=90,export_def_bones=True)
# A transparent portrait provides the same character for mobile, reduced motion, and WebGL failure.
scene.frame_set(72)
scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=48
scene.render.resolution_x=1100;scene.render.resolution_y=1500;scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.world.color=(.12,.12,.12)
bpy.ops.object.camera_add(location=(.3,-4,1.1));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.95))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.05;scene.camera=cam
for loc,color,energy,size in [((-3,-4,4),(1,.91,.74),380,4),((3,1,3),(.44,.66,1),500,3),((0,4,4),(1,.75,.28),350,3)]:
 bpy.ops.object.light_add(type='AREA',location=loc);light=bpy.context.object;light.data.color=color;light.data.energy=energy;light.data.size=size;light.rotation_euler=(Vector((0,0,1))-light.location).to_track_quat('-Z','Y').to_euler()
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(root/'public/images/ronaldo-portrait.png')
bpy.ops.render.render(write_still=True)
print('CINEMATIC_ASSET', (root/'public/models/ronaldo-cinematic.glb').stat().st_size,flush=True)
