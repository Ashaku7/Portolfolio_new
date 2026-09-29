import bpy, math, json
from mathutils import Vector, Matrix
from pathlib import Path
root=Path(r"C:\Users\akash\OneDrive\Desktop\Akash\scroll_portfolio")
bpy.ops.wm.open_mainfile(filepath=str(root/'artifacts/ronaldo-working.blend'))
mesh=next(o for o in bpy.context.scene.objects if o.type=='MESH')
mesh.name='Ronaldo'
mesh.rotation_mode='XYZ'
# The original face and toes point +X; the FBX skeleton faces +Y.
# Align before weighting so left/right limbs and knee flexion stay anatomical.
mesh.rotation_euler.z=math.pi/2
mesh.scale=(1.8/.977935791,)*3
bpy.context.view_layer.objects.active=mesh
bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True)
bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
floor=min(v.co.z for v in mesh.data.vertices)
for v in mesh.data.vertices:v.co.z-=floor
bpy.ops.import_scene.fbx(filepath=str(root/'cristiano-ronaldo/Ronaldo_60Hz (1).fbx'))
src=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
bind={b.name.split(':')[-1]:(src.matrix_world@b.matrix_local).to_quaternion() for b in src.data.bones}
samples=[]
for f in range(10,184,2):
 bpy.context.scene.frame_set(f)
 samples.append(({b.name.split(':')[-1]:(src.matrix_world@b.matrix).to_quaternion() for b in src.pose.bones},(src.matrix_world@src.pose.bones['frontwaistnewActor2:Hips'].matrix).translation.copy()))
for o in list(bpy.context.scene.objects):
 if o!=mesh:bpy.data.objects.remove(o,do_unlink=True)
data=bpy.data.armatures.new('RonaldoRig');rig=bpy.data.objects.new('RonaldoRig',data);bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active=rig;rig.select_set(True);mesh.select_set(False)
bpy.ops.object.mode_set(mode='EDIT')
joints={
'Hips':((0,0,.80),(0,0,.90),None),
'Spine':((0,0,.90),(0,0,1.04),'Hips'),
'Spine1':((0,0,1.04),(0,0,1.18),'Spine'),
'Spine2':((0,0,1.18),(0,0,1.31),'Spine1'),
'Spine3':((0,0,1.31),(0,0,1.47),'Spine2'),
'Neck':((0,0,1.47),(0,0,1.53),'Spine3'),
'Neck1':((0,0,1.53),(0,0,1.59),'Neck'),
'Head':((0,0,1.59),(0,0,1.78),'Neck1')}
for side,sign in [('Right',1),('Left',-1)]:
 def p(x,y,z):return (sign*x,y,z)
 joints.update({
 side+'Shoulder':(p(.04,0,1.44),p(.27,0,1.43),'Spine3'),
 side+'Arm':(p(.27,0,1.43),p(.49,0,1.42),side+'Shoulder'),
 side+'ForeArm':(p(.49,0,1.42),p(.73,0,1.41),side+'Arm'),
 side+'Hand':(p(.73,0,1.41),p(.90,0,1.40),side+'ForeArm'),
 side+'UpLeg':(p(.125,0,.80),p(.15,0,.43),'Hips'),
 side+'Leg':(p(.15,0,.43),p(.18,0,.09),side+'UpLeg'),
 side+'Foot':(p(.18,0,.09),p(.18,.10,.045),side+'Leg'),
 side+'ToeBase':(p(.18,.10,.045),p(.18,.16,.045),side+'Foot')})
for name,(head,tail,parent) in joints.items():
 b=data.edit_bones.new(name);b.head=head;b.tail=tail
 if parent:b.parent=data.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
# Heat weights bind the new skeleton to the optimized textured mesh.
bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);rig.select_set(True);bpy.context.view_layer.objects.active=rig
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
unweighted=sum(1 for v in mesh.data.vertices if not v.groups)
print('WEIGHT_CHECK',unweighted,len(mesh.data.vertices),flush=True)
if unweighted:
 # A watertight voxel proxy avoids heat-solver failures on the supplied scan topology.
 from mathutils.kdtree import KDTree
 proxy=mesh.copy();proxy.data=mesh.data.copy();bpy.context.collection.objects.link(proxy);proxy.name='WeightProxy'
 proxy.parent=None;proxy.modifiers.clear();proxy.vertex_groups.clear()
 bpy.ops.object.select_all(action='DESELECT');proxy.select_set(True);bpy.context.view_layer.objects.active=proxy
 remesh=proxy.modifiers.new('Watertight weight proxy','REMESH');remesh.mode='VOXEL';remesh.voxel_size=.012;remesh.use_smooth_shade=True
 bpy.ops.object.modifier_apply(modifier=remesh.name)
 rig.select_set(True);bpy.context.view_layer.objects.active=rig
 bpy.ops.object.parent_set(type='ARMATURE_AUTO')
 assert all(v.groups for v in proxy.data.vertices),'Proxy binding failed'
 tree=KDTree(len(proxy.data.vertices))
 for v in proxy.data.vertices:tree.insert(v.co,v.index)
 tree.balance()
 mesh.vertex_groups.clear()
 groups={g.index:mesh.vertex_groups.new(name=g.name) for g in proxy.vertex_groups}
 for v in mesh.data.vertices:
  weights={}
  for co,idx,distance in tree.find_n(v.co,4):
   strength=1/max(distance,.0001)**2
   for g in proxy.data.vertices[idx].groups:weights[g.group]=weights.get(g.group,0)+g.weight*strength
  strongest=sorted(weights.items(),key=lambda p:p[1],reverse=True)[:4];total=sum(w for _,w in strongest)
  for group,weight in strongest:groups[group].add([v.index],weight/total,'REPLACE')
 bpy.data.objects.remove(proxy,do_unlink=True)
 print('PROXY_BINDING_OK',len(mesh.vertex_groups),flush=True)
bpy.context.scene.render.fps=30
rig.animation_data_create()
rig.animation_data.action=bpy.data.actions.new('Ronaldo Celebration')
first_basis={}
for index,(rotations,hips) in enumerate(samples):
 f=index+1
 desired={}
 for b in rig.pose.bones:
  b.rotation_mode='QUATERNION'
  rest=b.bone.matrix_local
  q=rotations[b.name]@bind[b.name].inverted()@rest.to_quaternion()
  parent_matrix=desired[b.parent.name] if b.parent else Matrix.Identity(4)
  local_rest=b.parent.bone.matrix_local.inverted()@rest if b.parent else rest
  pos=(parent_matrix@local_rest).translation if b.parent else Vector((0,0,.80+(hips.z-.79)*.94))
  m=q.to_matrix().to_4x4();m.translation=pos;desired[b.name]=m
  basis=local_rest.inverted()@parent_matrix.inverted()@m
  b.rotation_quaternion=basis.to_quaternion()
  b.location=basis.translation if not b.parent else Vector()
  b.scale=(1,1,1)
  b.keyframe_insert(data_path='rotation_quaternion',frame=f,group=b.name)
  if not b.parent:b.keyframe_insert(data_path='location',frame=f,group=b.name)
  if index==0:first_basis[b.name]=(b.rotation_quaternion.copy(),b.location.copy())
# A short recovery blends the end back to the first moving pose, avoiding the FBX calibration T-pose.
end=len(samples)+15
for b in rig.pose.bones:
 b.rotation_quaternion,b.location=first_basis[b.name]
 b.keyframe_insert(data_path='rotation_quaternion',frame=end,group=b.name)
 if not b.parent:b.keyframe_insert(data_path='location',frame=end,group=b.name)
for fc in rig.animation_data.action.fcurves:
 for key in fc.keyframe_points:key.interpolation='LINEAR'
scene=bpy.context.scene;scene.frame_start=1;scene.frame_end=end
# The captured turn finishes facing -Y (the website camera after glTF export).
rig.rotation_euler.z=0
for img in bpy.data.images:
 if img.size[0]>2048:img.scale(2048,max(1,round(img.size[1]*2048/img.size[0])))
scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);rig.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(root/'public/models/ronaldo-animated.glb'),export_format='GLB',use_selection=True,export_animations=True,export_frame_range=True,export_force_sampling=True,export_animation_mode='ACTIVE_ACTIONS',export_image_format='JPEG',export_jpeg_quality=85,export_def_bones=True)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'artifacts/ronaldo-rigged.blend'))
print('EXPORTED',end, len(mesh.data.vertices), (root/'public/models/ronaldo-animated.glb').stat().st_size,flush=True)
# Render the baked action at three points to inspect deformation.
scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=24
scene.render.resolution_x=700;scene.render.resolution_y=700;scene.render.resolution_percentage=100
bpy.ops.object.camera_add(location=(2,-5,1.5));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.8;scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=(1,-3,4));light=bpy.context.object;light.data.energy=400;light.data.size=4;light.rotation_euler=(Vector((0,0,1))-light.location).to_track_quat('-Z','Y').to_euler()
for frame in [12,40,68]:
 scene.frame_set(frame);scene.render.filepath=str(root/f'artifacts/ronaldo-pose-{frame}.png');bpy.ops.render.render(write_still=True)
