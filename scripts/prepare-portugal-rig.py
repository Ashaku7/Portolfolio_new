import bpy, math
from pathlib import Path
from mathutils import Vector, Matrix
from mathutils.kdtree import KDTree
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'artifacts/ronaldo-rigged.blend'))
oldrig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
tpose={b.name:b.matrix_local.to_quaternion().copy() for b in oldrig.data.bones}
bpy.ops.wm.open_mainfile(filepath=str(root/'artifacts/portugal-rest.blend'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
bpy.ops.import_scene.fbx(filepath=str(root/'cristiano-ronaldo/Ronaldo_60Hz (1).fbx'))
src=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
bind={b.name.split(':')[-1]:(src.matrix_world@b.matrix_local).to_quaternion() for b in src.data.bones}
samples=[]
for f in range(10,184,2):
 bpy.context.scene.frame_set(f)
 samples.append(({b.name.split(':')[-1]:(src.matrix_world@b.matrix).to_quaternion() for b in src.pose.bones},(src.matrix_world@src.pose.bones['frontwaistnewActor2:Hips'].matrix).translation.copy()))
for o in list(bpy.context.scene.objects):
 if o not in meshes:bpy.data.objects.remove(o,do_unlink=True)
data=bpy.data.armatures.new('PortugalRig');rig=bpy.data.objects.new('PortugalRig',data);bpy.context.collection.objects.link(rig)
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig
bpy.ops.object.mode_set(mode='EDIT')
joints={
'Hips':((0,0,.94),(0,0,1.00),None),
'Spine':((0,0,1.00),(0,0,1.12),'Hips'),
'Spine1':((0,0,1.12),(0,0,1.25),'Spine'),
'Spine2':((0,0,1.25),(0,0,1.37),'Spine1'),
'Spine3':((0,0,1.37),(0,0,1.49),'Spine2'),
'Neck':((0,0,1.49),(0,0,1.54),'Spine3'),
'Neck1':((0,0,1.54),(0,0,1.59),'Neck'),
'Head':((0,0,1.59),(0,0,1.78),'Neck1')}
for side,sign in [('Right',1),('Left',-1)]:
 def p(x,y,z):return (sign*x,y,z)
 joints.update({
 side+'Shoulder':(p(.04,0,1.46),p(.19,0,1.46),'Spine3'),
 side+'Arm':(p(.19,0,1.46),p(.38,0,1.27),side+'Shoulder'),
 side+'ForeArm':(p(.38,0,1.27),p(.535,0,1.10),side+'Arm'),
 side+'Hand':(p(.535,0,1.10),p(.635,0,1.01),side+'ForeArm'),
 side+'UpLeg':(p(.12,0,.94),p(.155,0,.54),'Hips'),
 side+'Leg':(p(.155,0,.54),p(.178,0,.085),side+'UpLeg'),
 side+'Foot':(p(.178,0,.085),p(.178,.10,.045),side+'Leg'),
 side+'ToeBase':(p(.178,.10,.045),p(.178,.16,.045),side+'Foot')})
for name,(head,tail,parent) in joints.items():
 b=data.edit_bones.new(name);b.head=head;b.tail=tail
 if parent:b.parent=data.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
# Bind a watertight body proxy, keeping the original UVs and all visible geometry.
copies=[]
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:
 if o.name in ['Portugal_hair','Portugal_eyes','Portugal_eyelashes']:continue
 p=o.copy();p.data=o.data.copy();bpy.context.collection.objects.link(p);p.select_set(True);copies.append(p)
bpy.context.view_layer.objects.active=copies[0];bpy.ops.object.join();proxy=bpy.context.object;proxy.name='WeightProxy'
remesh=proxy.modifiers.new('Weight surface','REMESH');remesh.mode='VOXEL';remesh.voxel_size=.02;remesh.use_smooth_shade=True
bpy.ops.object.modifier_apply(modifier=remesh.name)
rig.select_set(True);bpy.context.view_layer.objects.active=rig;bpy.ops.object.parent_set(type='ARMATURE_AUTO')
print('PROXY',len(proxy.data.vertices),sum(not v.groups for v in proxy.data.vertices),flush=True)
weighted=[v for v in proxy.data.vertices if v.groups]
assert len(weighted)>.95*len(proxy.data.vertices),'Proxy binding failed'
repair=KDTree(len(weighted))
for v in weighted:repair.insert(v.co,v.index)
repair.balance()
for v in proxy.data.vertices:
 if not v.groups:
  co,idx,d=repair.find(v.co)
  for g in proxy.data.vertices[idx].groups:proxy.vertex_groups[g.group].add([v.index],g.weight,'REPLACE')
tree=KDTree(len(proxy.data.vertices))
for v in proxy.data.vertices:tree.insert(v.co,v.index)
tree.balance()
for o in meshes:
 o.parent=rig;mod=o.modifiers.new('Portugal Skeleton','ARMATURE');mod.object=rig
 groups={g.index:o.vertex_groups.new(name=g.name) for g in proxy.vertex_groups}
 head=o.vertex_groups.get('Head')
 for v in o.data.vertices:
  if o.name in ['Portugal_hair','Portugal_eyes','Portugal_eyelashes'] or (o.name=='Portugal_face' and v.co.z>=1.565):
   head.add([v.index],1,'REPLACE');continue
  weights={}
  for co,idx,d in tree.find_n(v.co,4):
   strength=1/max(d,.0001)**2
   for g in proxy.data.vertices[idx].groups:weights[g.group]=weights.get(g.group,0)+g.weight*strength
  strongest=sorted(weights.items(),key=lambda p:p[1],reverse=True)[:4];total=sum(w for _,w in strongest)
  for group,w in strongest:groups[group].add([v.index],w/total,'REPLACE')
 assert all(v.groups for v in o.data.vertices),o.name
bpy.data.objects.remove(proxy,do_unlink=True)
print('WEIGHTS_OK',flush=True)
scene=bpy.context.scene;scene.render.fps=30
rig.animation_data_create();rig.animation_data.action=bpy.data.actions.new('Ronaldo Siuu')
for index,(rotations,hips) in enumerate(samples):
 desired={}
 for b in rig.pose.bones:
  b.rotation_mode='QUATERNION';rest=b.bone.matrix_local
  # The mesh binds in A pose; upper limbs follow the existing T-reference capture.
  reference=tpose[b.name] if any(b.name.endswith(s) for s in ['Shoulder','Arm','ForeArm','Hand']) else rest.to_quaternion()
  q=rotations[b.name]@bind[b.name].inverted()@reference
  parent=desired[b.parent.name] if b.parent else Matrix.Identity(4)
  local=b.parent.bone.matrix_local.inverted()@rest if b.parent else rest
  pos=(parent@local).translation if b.parent else Vector((0,0,.94+(hips.z-.79)*1.10))
  m=q.to_matrix().to_4x4();m.translation=pos;desired[b.name]=m
  basis=local.inverted()@parent.inverted()@m
  b.rotation_quaternion=basis.to_quaternion();b.location=basis.translation if not b.parent else Vector();b.scale=(1,1,1)
  b.keyframe_insert(data_path='rotation_quaternion',frame=index,group=b.name)
  if not b.parent:b.keyframe_insert(data_path='location',frame=index,group=b.name)
for fc in rig.animation_data.action.fcurves:
 for k in fc.keyframe_points:k.interpolation='LINEAR'
scene.frame_start=0;scene.frame_end=len(samples)-1;scene.frame_set(0)
# Keep face and kit maps at source resolution; fine alpha cards need less bandwidth.
for img in bpy.data.images:
 if any(tag in img.name for tag in ['RGB_hair','R_hair_tr','R_eyelashes-tr']) and img.size[0]>1024:img.scale(1024,1024)
# Pack source textures so the working rig is portable.
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(root/'artifacts/portugal-rigged.blend'))
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for o in meshes:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(root/'public/models/ronaldo-portugal.glb'),export_format='GLB',use_selection=True,export_animations=True,export_frame_range=True,export_force_sampling=True,export_animation_mode='ACTIVE_ACTIONS',export_image_format='AUTO',export_jpeg_quality=90,export_def_bones=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_draco_position_quantization=16,export_draco_normal_quantization=12,export_draco_texcoord_quantization=14)
print('EXPORT',len(samples),(root/'public/models/ronaldo-portugal.glb').stat().st_size,flush=True)
scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=32
scene.render.resolution_x=800;scene.render.resolution_y=950;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.14,.14,.14,1)
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for loc in [(-3,4,4),(3,-4,4)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=400;l.data.size=4;aim(l,(0,0,1))
bpy.ops.object.camera_add(location=(.2,4,1.3));cam=bpy.context.object;aim(cam,(0,0,1.15));cam.data.type='ORTHO';cam.data.ortho_scale=2.6;scene.camera=cam
for f in [1,12,40,68,87]:
 scene.frame_set(f)
 cam.location=(.2,4 if f<50 else -4,1.3);aim(cam,(0,0,1.15))
 scene.render.filepath=str(root/f'artifacts/portugal-pose-{f}.png');bpy.ops.render.render(write_still=True)
scene.frame_set(0);cam.location=(.2,4,1.3);aim(cam,(0,0,1.1));cam.data.ortho_scale=2.25
scene.render.film_transparent=True;scene.render.filepath=str(root/'public/images/ronaldo-portugal-portrait.png');bpy.ops.render.render(write_still=True)
