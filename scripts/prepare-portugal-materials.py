import bpy, math, json
from mathutils import Vector
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=Path(r"C:\Users\akash\Downloads\3d_Ripper_Pro_v108\Downloads\3dpassionnet\03- A.Pose.Rigged.Ronaldo.Worldcup.2026")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.obj_import(filepath=str(source/'48512d401d994c148f5e7736e627a51c.obj'),use_split_groups=True,forward_axis='Y',up_axis='Z')
# These planar export fragments are separate from the complete textured character.
fragments=[o for o in bpy.context.scene.objects if '_logo_' in o.name]
print('EXCLUDED_PLANAR_FRAGMENTS',sum(len(o.data.polygons) for o in fragments),flush=True)
for o in fragments:bpy.data.objects.remove(o,do_unlink=True)
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
def tex(suffix,noncolor=False):
 path=next(source.glob('*'+suffix+'.jpeg'))
 img=bpy.data.images.load(str(path),check_existing=True)
 if noncolor:img.colorspace_settings.name='Non-Color'
 return img
def material(name,color=None,alpha=None,normal=None,roughness=.75):
 mat=bpy.data.materials.new(name);mat.use_nodes=True
 nodes=mat.node_tree.nodes;links=mat.node_tree.links;bsdf=nodes.get('Principled BSDF')
 bsdf.inputs['Metallic'].default_value=0;bsdf.inputs['Roughness'].default_value=roughness
 if color:
  n=nodes.new('ShaderNodeTexImage');n.image=tex(color);links.new(n.outputs['Color'],bsdf.inputs['Base Color'])
 else:bsdf.inputs['Base Color'].default_value=(.025,.017,.012,1)
 if alpha:
  n=nodes.new('ShaderNodeTexImage');n.image=tex(alpha,True);links.new(n.outputs['Color'],bsdf.inputs['Alpha'])
  mat.surface_render_method='DITHERED';mat.use_transparency_overlap=False
 if normal:
  n=nodes.new('ShaderNodeTexImage');n.image=tex(normal,True)
  bump=nodes.new('ShaderNodeNormalMap');bump.inputs['Strength'].default_value=.25
  links.new(n.outputs['Color'],bump.inputs['Color']);links.new(bump.outputs['Normal'],bsdf.inputs['Normal'])
 return mat
mats={
'kit':material('Portugal Kit','RGB_kit',normal='R_kit_nrm'),
'arms':material('Skin Hands','RGB_arms',roughness=.65),
'boots':material('Boots','RGB_boot',normal='R_boot_nrm',roughness=.55),
'legs':material('Skin Legs','RGB_thighs',roughness=.7),
'eyelashes':material('Eyelashes',alpha='R_eyelashes-tr'),
'eyes':material('Eyes','RGB_eyes',roughness=.32),
'hair':material('Hair','RGB_hair',alpha='R_hair_tr',roughness=.75),
'face':material('Face','RGB_face2',roughness=.65)}
scale=1.8/(1.8949099779129028-.0012309999438002706)
for o in meshes:
 kind=o.name.split('_')[2];o.name='Portugal_'+kind
 o.data.materials.clear();o.data.materials.append(mats[kind])
 for v in o.data.vertices:
  x,y,z=v.co;v.co=(-x*scale,z*scale,(y-.001231)*scale)
 for p in o.data.polygons:p.use_smooth=True
print('CHARACTER',sum(len(o.data.vertices) for o in meshes),sum(len(o.data.polygons) for o in meshes),flush=True)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'artifacts/portugal-rest.blend'))
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=32
scene.render.resolution_x=800;scene.render.resolution_y=950;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.14,.14,.14,1)
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for loc,color,energy in [((-3,4,4),(1,.93,.82),350),((3,-2,3),(.7,.8,1),300)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=energy;l.data.color=color;l.data.size=4;aim(l,(0,0,1))
bpy.ops.object.camera_add(location=(.2,4,1.1));cam=bpy.context.object;aim(cam,(0,0,.95));cam.data.type='ORTHO';cam.data.ortho_scale=2.05;scene.camera=cam
scene.render.filepath=str(root/'artifacts/portugal-rest-front.png');bpy.ops.render.render(write_still=True)
cam.location=(.3,3,1.68);aim(cam,(0,0,1.6));cam.data.ortho_scale=.65
scene.render.filepath=str(root/'artifacts/portugal-face.png');bpy.ops.render.render(write_still=True)
