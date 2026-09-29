import bpy, math
from mathutils import Vector
from pathlib import Path
root=Path.cwd()
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.cycles.max_bounces=5;scene.cycles.diffuse_bounces=3;scene.cycles.glossy_bounces=3;scene.cycles.sample_clamp_indirect=3
scene.world.color=(.12,.12,.12)
scene.view_settings.view_transform='Standard';scene.view_settings.look='Medium High Contrast' if 'Medium High Contrast' in [] else 'None';scene.view_settings.exposure=0
static=[]
def pos(p):return(p[0],-p[2],p[1])
def mat(name,color,rough=.7,metal=0,texture=None):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=n.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal
 uv=n.new('ShaderNodeUVMap');uv.uv_map='MaterialUV'
 if texture:
  tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(root/'public/room'/texture));l.new(uv.outputs['UV'],tex.inputs['Vector']);h=n.new('ShaderNodeHueSaturation');h.inputs['Saturation'].default_value=.22;h.inputs['Value'].default_value=.56;l.new(tex.outputs['Color'],h.inputs['Color']);l.new(h.outputs[0],bs.inputs['Base Color'])
 noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=160 if name=='Plaster' else 65;noise.inputs['Detail'].default_value=2
 l.new(uv.outputs['UV'],noise.inputs['Vector']);b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.16;b.inputs['Distance'].default_value=.015;l.new(noise.outputs['Fac'],b.inputs['Height']);l.new(b.outputs['Normal'],bs.inputs['Normal'])
 return m
wood=mat('Smoked walnut',(.12,.065,.036),.58,texture='wood-diff.jpg');plaster=mat('Plaster',(.38,.37,.35),.9);stone=mat('Honed limestone',(.20,.19,.18),.72);black=mat('Graphite metal',(.035,.036,.038),.35,.65);leather=mat('Bench leather',(.045,.036,.032),.85);red=mat('Oxide accent',(.24,.038,.026),.7);trim=mat('Brushed aluminium',(.35,.36,.37),.38,.8)
led=bpy.data.materials.new('Warm LED');led.use_nodes=True;bs=led.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(1,.9,.78,1);bs.inputs['Emission Color'].default_value=(1,.89,.72,1);bs.inputs['Emission Strength'].default_value=4

def box(name,p,s,m,bevel=.015):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos(p));o=bpy.context.object;o.name=name;o.dimensions=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m)
 if bevel:
  b=o.modifiers.new('Edge highlights','BEVEL');b.width=min(bevel,min(s)/3);b.segments=3;bpy.ops.object.modifier_apply(modifier=b.name)
 for f in o.data.polygons:f.use_smooth=False
 if o.data.uv_layers:o.data.uv_layers[0].name='MaterialUV'
 static.append(o);return o

def area(name,p,target,power,size,color=(1,.92,.82),size_y=None):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='RECTANGLE';d.size=size;d.size_y=size_y or size;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=pos(p);o.rotation_euler=(Vector(pos(target))-o.location).to_track_quat('-Z','Y').to_euler();return o
# Architecture, real material thicknesses and recessed construction.
box('Foundation',(0,-.09,.2),(12.2,.16,11),black)
for x in range(10):
 for z in range(8):box('Stone tile',(-5.4+x*1.2,-.015,-3+z*1.2),(1.192,.05,1.192),stone,.003)
box('Rear plaster',(-1.05,2.08,-3.55),(9.9,4.2,.22),plaster)
box('Door pier',(5.8,2.08,-3.55),(.4,4.2,.22),plaster);box('Door lintel',(4.8,3.64,-3.55),(1.7,1.08,.22),plaster)
box('West plaster',(-6,2.08,.1),(.18,4.2,7.3),plaster);box('East plaster',(6,2.08,-.2),(.18,4.2,6.8),plaster)
box('Ceiling',(0,4.17,0),(12.2,.12,7.1),black)
box('Rear skirting',(-1.05,.10,-3.41),(9.9,.18,.04),black)
for x in [-5.89,5.89]:box('Side skirting',(x,.10,.0),(.035,.18,7),black)
# Timber wall panelling gives the composition a coherent architectural frame.
for x in [-5.6,-.42,.0,.42]:
 box('Rear timber pier',(x,1.72,-3.35),(.22,3.45,.14),wood)
for z in [i*.12-.9 for i in range(24)]:box('West acoustic slat',(-5.87,1.65,z),(.08,3.2,.055),wood,.008)
# One shared locker, two broad sections: host jersey and hobbies.
for i,x in enumerate([-3.95,-1.65]):
 box('Locker back',(x,1.6,-3.07),(2.20,3.05,.10),wood)
 for dx in [-1.14,1.14]:box('Locker side',(x+dx,1.57,-2.78),(.07,3.1,.70),wood)
 shelves=[.16,.59,2.78,3.11] if i==0 else [.16,.59,1.31,1.90,2.78,3.11]
 for y in shelves:box('Locker shelf',(x,y,-2.79),(2.28,.075,.70),wood)
 if i==0:box('Locker cushion',(x,.66,-2.57),(2.06,.09,.46),leather,.025)
 box('Locker plinth',(x,.037,-2.81),(2.20,.08,.6),black)
 box('Name plate',(x,2.99,-2.42),(1.85,.19,.025),black,.007)
 box('Shelf LED',(x,2.72,-2.7),(2.07,.012,.03),led,.002)
 area('Locker warm strip',(x,2.68,-2.61),(x,1.3,-2.91),42,1.85,(1,.8,.62),.12)
 if i==0:box('Hanging rail',(x,2.47,-2.86),(2.03,.023,.023),trim,.009)
 for n in range(7):box('Vent',(x-.6+n*.20,.35,-2.415),(.09,.016,.018),black,.005)
# Bench and analysis desk, with slender metal legs and bevelled tops.
box('Bench',(-2.8,.47,.8),(3.4,.09,.58),wood)
for x in [-4.1,-1.5]:box('Bench leg',(x,.23,.8),(.065,.46,.47),black)
box('Analysis desk',(-.75,.83,-.82),(2.3,.10,.95),wood)
for x in [-1.73,.23]:
 box('Desk leg',(x,.41,-.82),(.055,.82,.65),black);box('Desk foot',(x,.04,-.82),(.13,.045,.8),black)
box('Contact desk',(3.6,.76,-1.55),(1.05,.07,.62),wood)
for x in [3.18,4.02]:box('Contact leg',(x,.38,-1.55),(.055,.76,.45),black)
# Recessed tunnel with repeating portal ribs and a red matchday strip.
for x in [3.92,5.69]:box('Tunnel wall',(x,1.6,-5.5),(.15,3.2,4),plaster)
box('Tunnel ceiling',(4.8,3.15,-5.5),(1.8,.15,4),black)
box('Tunnel floor',(4.8,-.005,-5.5),(1.75,.03,4.2),black)
for z in [-3.6,-4.5,-5.4,-6.3,-7.2]:
 for x in [4.02,5.58]:box('Tunnel rib',(x,1.5,z),(.055,3,.07),black)
 box('Tunnel light',(4.8,3.03,z),(1.48,.025,.055),led,.002)
box('Matchday stripe',(4.06,.25,-5.5),(.023,.12,4.2),red)
# Suspended fixtures and ceiling detail.
for z in [-2.6,-.8,1.2]:
 box('Suspended fixture',(.1,3.8,z),(8.8,.09,.10),black)
 box('Diffuser',(.1,3.745,z),(8.5,.018,.065),led,.002)
 area('Ceiling softbox',(.1,3.69,z),(.1,0,z),360,7.8,(1,.9,.79),.75)
 for x in [-3,3]:box('Fixture suspension',(x,3.96,z),(.008,.33,.008),black,.002)
area('Entrance daylight',(0,2.7,6),(0,1,-2),650,7,(.83,.9,1),3)
area('Tunnel daylight',(4.8,2,-7),(4.8,1,-3),250,1.5,(.83,.91,1),2.8)
# Preserve the editable scene and a path-traced reference image.
bpy.ops.object.camera_add(location=pos((4.8,2.45,8.4)));cam=bpy.context.object;cam.rotation_euler=(Vector(pos((-.1,1.55,-1.55)))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=35;scene.camera=cam
scene.render.resolution_x=1440;scene.render.resolution_y=1000;scene.render.resolution_percentage=75
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(root/'artifacts/architecture-cycles.png')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'artifacts/room-architecture.blend'))
bpy.ops.render.render(write_still=True)
# Pack static light transport into a single atlas; original material UVs remain separate.
bpy.ops.object.select_all(action='DESELECT')
for o in static:o.select_set(True)
bpy.context.view_layer.objects.active=static[0];bpy.ops.object.join();room=bpy.context.object;room.name='BakedArchitecture'
room.data.uv_layers.new(name='Lightmap');room.data.uv_layers.active_index=1;room.data.uv_layers['Lightmap'].active_render=True
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.008,area_weight=.2);bpy.ops.object.mode_set(mode='OBJECT')
image=bpy.data.images.new('Room light transport',width=2048,height=2048,alpha=False);image.generated_color=(.02,.02,.02,1)
for m in room.data.materials:
 if not m:continue
 node=m.node_tree.nodes.new('ShaderNodeTexImage');node.image=image;m.node_tree.nodes.active=node
scene.render.bake.use_clear=True;scene.render.bake.margin=12;scene.cycles.samples=24
bpy.ops.object.bake(type='COMBINED')
image.filepath_raw=str(root/'public/room/architecture-lightmap.png');image.file_format='PNG';image.save()
# glTF unlit material carries the calculated indirect light, with no runtime light double-up.
unlit=bpy.data.materials.new('Baked indirect lighting');unlit.use_nodes=True;n=unlit.node_tree.nodes;n.clear();tex=n.new('ShaderNodeTexImage');tex.image=image;uv=n.new('ShaderNodeUVMap');uv.uv_map='Lightmap';em=n.new('ShaderNodeEmission');out=n.new('ShaderNodeOutputMaterial');l=unlit.node_tree.links;l.new(uv.outputs['UV'],tex.inputs['Vector']);l.new(tex.outputs['Color'],em.inputs['Color']);l.new(em.outputs[0],out.inputs[0]);room.data.materials.clear();room.data.materials.append(unlit)
for f in room.data.polygons:f.material_index=0
# Remove the source UV layer only after baking, leaving the atlas as TEXCOORD_0.
room.data.uv_layers.remove(room.data.uv_layers['MaterialUV'])
bpy.ops.export_scene.gltf(filepath=str(root/'public/models/room-architecture.glb'),export_format='GLB',use_selection=True,export_materials='EXPORT',export_yup=True,export_apply=True)
print('ARCHITECTURE BAKE COMPLETE',flush=True)