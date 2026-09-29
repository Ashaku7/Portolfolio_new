import bpy, math
from mathutils import Vector
from mathutils.kdtree import KDTree
from pathlib import Path
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'artifacts/ronaldo-rigged.blend'))
rig=bpy.data.objects['RonaldoRig'];old=bpy.data.objects['Ronaldo']
bpy.ops.import_scene.gltf(filepath=str(root/'cristiano-ronaldo/source/soccer player 3d model.glb'))
mesh=bpy.context.object
if mesh.type!='MESH':mesh=next(o for o in bpy.context.selected_objects if o.type=='MESH')
mesh.name='RonaldoCloseup'
mesh.rotation_mode='XYZ';mesh.rotation_euler.z=math.pi/2
mesh.scale=(1.8/.977935791,)*3
bpy.context.view_layer.objects.active=mesh
bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True)
bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
floor=min(v.co.z for v in mesh.data.vertices)
for v in mesh.data.vertices:v.co.z-=floor
# Keep over three times the original web mesh detail; the animation and bone mapping are unchanged.
mod=mesh.modifiers.new('Close-up geometry','DECIMATE');mod.ratio=.12
bpy.ops.object.modifier_apply(modifier=mod.name)
for p in mesh.data.polygons:p.use_smooth=True
tree=KDTree(len(old.data.vertices))
for v in old.data.vertices:tree.insert(v.co,v.index)
tree.balance()
groups={g.index:mesh.vertex_groups.new(name=g.name) for g in old.vertex_groups}
head=mesh.vertex_groups['Head']
for v in mesh.data.vertices:
 # This capture has no facial animation. Keep the face rigid so neck weights cannot stretch it.
 if v.co.z>=1.585:
  head.add([v.index],1,'REPLACE');continue
 weights={}
 for co,idx,distance in tree.find_n(v.co,4):
  strength=1/max(distance,.0001)**2
  for g in old.data.vertices[idx].groups:weights[g.group]=weights.get(g.group,0)+g.weight*strength
 strongest=sorted(weights.items(),key=lambda p:p[1],reverse=True)[:4];total=sum(w for _,w in strongest)
 for group,weight in strongest:groups[group].add([v.index],weight/total,'REPLACE')
mesh.parent=rig
arm=mesh.modifiers.new('Armature','ARMATURE');arm.object=rig
bpy.data.objects.remove(old,do_unlink=True)
material=mesh.data.materials[0]
for node in material.node_tree.nodes:
 if node.type=='TEX_IMAGE' and node.image:
  img=node.image;limit=4096 if 'basecolor' in img.name else 2048
  if img.size[0]>limit:img.scale(limit,round(img.size[1]*limit/img.size[0]))
 if node.type=='BSDF_PRINCIPLED':
  for socket in ['Metallic','Roughness']:
   for link in list(node.inputs[socket].links):material.node_tree.links.remove(link)
  node.inputs['Metallic'].default_value=0;node.inputs['Roughness'].default_value=.78
 if node.type=='NORMAL_MAP':node.inputs['Strength'].default_value=.16
scene=bpy.context.scene;scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);rig.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(root/'public/models/ronaldo-closeup.glb'),export_format='GLB',use_selection=True,export_animations=True,export_frame_range=True,export_force_sampling=True,export_animation_mode='ACTIVE_ACTIONS',export_image_format='JPEG',export_jpeg_quality=95,export_def_bones=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_draco_position_quantization=16,export_draco_normal_quantization=12,export_draco_texcoord_quantization=16)
print('CLOSEUP',len(mesh.data.vertices),len(mesh.data.polygons),(root/'public/models/ronaldo-closeup.glb').stat().st_size,flush=True)
