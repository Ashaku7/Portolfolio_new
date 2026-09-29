import bpy,math,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
source=root/'02- Cristiano.Ronaldo.skills'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(source/'4db805ac6cae4cdcb0e3087e68e574a7.fbx'))
scene=bpy.context.scene;scene.frame_set(1)
rig=next(o for o in scene.objects if o.type=='ARMATURE')
meshes=[o for o in scene.objects if o.type=='MESH']
# Restore the missing solid shorts material and the supplied hair alpha mask.
for m in bpy.data.materials:
 if not m.use_nodes:continue
 bs=m.node_tree.nodes.get('Principled BSDF')
 if not bs:continue
 bs.inputs['Metallic'].default_value=0;bs.inputs['Roughness'].default_value=.7
 bs.inputs['Specular IOR Level'].default_value=.35
 bs.inputs['Specular Tint'].default_value=(1,1,1,1)
 if m.name=='blue':
  for link in list(bs.inputs['Base Color'].links):m.node_tree.links.remove(link)
  bs.inputs['Base Color'].default_value=(.013,.023,.12,1)
 if m.name=='hair':
  n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(str(next(source.glob('*R_hair_tr.jpeg'))));n.image.colorspace_settings.name='Non-Color'
  m.node_tree.links.new(n.outputs['Color'],bs.inputs['Alpha']);m.surface_render_method='DITHERED'
 for n in m.node_tree.nodes:
  if n.type=='NORMAL_MAP':n.inputs['Strength'].default_value=.25
 for p in meshes:
  for face in p.data.polygons:face.use_smooth=True
deps=bpy.context.evaluated_depsgraph_get()
points=[o.matrix_world@v.co for o in meshes if 'Ball' not in o.name for v in o.evaluated_get(deps).data.vertices]
low=min(v.z for v in points);high=max(v.z for v in points);scale=1.8/(high-low)
wrapper=bpy.data.objects.new('Juggling Ronaldo',None);scene.collection.objects.link(wrapper)
for o in list(scene.objects):
 if o!=wrapper and not o.parent:o.parent=wrapper
wrapper.scale=(scale,)*3;wrapper.rotation_euler.z=math.pi;wrapper.location.z=-low*scale
for a in bpy.data.actions:
 for fc in a.fcurves:
  for k in fc.keyframe_points:
   k.co.x-=1;k.handle_left.x-=1;k.handle_right.x-=1
scene.frame_start=0;scene.frame_end=503
samples=[]
for f in range(504):
 scene.frame_set(f)
 ball=(rig.matrix_world@rig.pose.bones['Ball'].matrix).translation
 feet=[(rig.matrix_world@b.matrix).translation for b in rig.pose.bones if 'Foot' in b.name]
 samples.append({'frame':f,'height':ball.z,'distance':min((ball-v).length for v in feet)})
touches=[s for i,s in enumerate(samples) if i>=3 and i<501 and s['distance']==min(x['distance'] for x in samples[i-3:i+4]) and s['distance']<.4]
cueframes=[0]+[min(touches,key=lambda s:abs(s['frame']-target))['frame'] for target in [168,335]]
(root/'artifacts/juggling-motion.json').write_text(json.dumps({'scale':scale,'fps':scene.render.fps,'frames':504,'cueFrames':cueframes,'touches':touches},indent=2),encoding='utf-8')
print('JUGGLE_CUES',cueframes,'SCALE',scale,flush=True)
scene.frame_set(0)
# One scene clip keeps the skinned ball and player synchronized.
bpy.ops.export_scene.gltf(filepath=str(root/'public/models/ronaldo-juggling.glb'),export_format='GLB',export_animations=True,export_animation_mode='SCENE',export_anim_scene_split_object=False,export_frame_range=True,export_force_sampling=True,export_image_format='AUTO',export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_draco_position_quantization=16,export_draco_normal_quantization=12,export_draco_texcoord_quantization=14)
for image in list(bpy.data.images):
 if image.size[0]==0:bpy.data.images.remove(image)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(root/'artifacts/ronaldo-juggling.blend'))
# Transparent fallback and pose checks.
scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=24
scene.render.resolution_x=700;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.16,.18,.21,1)
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for loc,power,color in [((-3,4,5),500,(1,.91,.75)),((3,-3,4),550,(.65,.8,1))]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.color=color;l.data.size=4;aim(l,(0,0,1))
bpy.ops.object.camera_add(location=(.3,4,1.3));cam=bpy.context.object;aim(cam,(0,0,1.03));cam.data.type='ORTHO';cam.data.ortho_scale=2.7;scene.camera=cam
for f in [0,168,335]:
 scene.frame_set(f);scene.render.filepath=str(root/f'artifacts/juggling-pose-{f}.png');bpy.ops.render.render(write_still=True)
scene.frame_set(0);scene.render.filepath=str(root/'public/images/ronaldo-juggling-poster.png');bpy.ops.render.render(write_still=True)
print('JUGGLE_READY',(root/'public/models/ronaldo-juggling.glb').stat().st_size,flush=True)
