/* Assignment 3: Earthquake Visualization
 * UMN CSCI 4611 Instructors 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022-2024
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute outside the course without permission from the instructor
 */ 

import * as gfx from 'gophergfx'
import { EarthquakeMarker } from './EarthquakeMarker';
import { EarthquakeRecord } from './EarthquakeRecord';

export class Earth extends gfx.Node3
{
    private earthMesh: gfx.MorphMesh3;

    public globeMode: boolean;

    constructor()
    {
        // Call the superclass constructor
        super();

        this.earthMesh = new gfx.MorphMesh3();

        this.globeMode = false;
    }

    public initialize(): void
    {
         // Initialize texture: you can change to a lower-res texture here if needed
        // Note that this won't display properly until you assign texture coordinates to the mesh
        this.earthMesh.material.texture = new gfx.Texture('./assets/earth-2k.png');

        // These parameters determine the appearance in the wireframe and vertex display modes
        this.earthMesh.material.ambientColor.set(0, 1, 1);
        this.earthMesh.material.pointSize = 10;
        
        // This disables mipmapping, which makes the texture appear sharper
        this.earthMesh.material.texture.setMinFilter(true, false);   

        // Add the mesh as a child of this node
        this.add(this.earthMesh);
    }


    // You should use meshResolution to define the resolution of your flat map and globe map
    // using a nested loop. 20x20 is reasonable for a good looking sphere, and you don't
    // need to change the default value to complete the base assignment  However, if you want 
    // to use height map or bathymetry data for a wizard bonus, you might need to increase
    // the default mesh resolution to get better results.
    public createMesh(meshResolution: number): void
    {
        // Precalculated vertices and normals for the earth plane mesh.
        // After we compute them, we can store them directly in the earthMesh,
        // so they don't need to be member variables.
        const mapVertices: gfx.Vector3[] = [];
        const mapNormals: gfx.Vector3[] = [];
        const Vertices: gfx.Vector3[] = [];
        const Normal: gfx.Vector3[] = [];




        // Part 1: Creating the Flat Map Mesh
        // As a demonstration, this code creates a rectangle with two triangles.
        // Four vertices are defined for the corners in latitude and longitude. 
        // These values need to be converted to the coordinates for the flat map.
        // You should replace this code with a nested loop as described in the readme.
        //maybe:
        // Calculate the increments for latitude and longitude based on the mesh resolution
        for(let i = 0; i <= meshResolution; i++){
            for(let j = 0; j <= meshResolution; j++){
                const latitudee = 180 * i/meshResolution - 90;
                const longitudee = 360 * j/meshResolution - 180;
                mapVertices.push(this.convertLatLongToPlane(latitudee, longitudee));
                mapNormals.push(new gfx.Vector3(0, 0, 1));
                Vertices.push(this.convertLatLongToSphere(latitudee,longitudee));
            }
        }


        // Define indices into the array for the two triangles.
        // I recommend doing this in another nested loop that is completely separate
        // from the one you added above to define the vertices and normals.
        const triangleindices: number[] = [];
        for(let i = 0; i < meshResolution; i++){
            for(let j = 0; j < meshResolution; j++){
                const topLeft = (meshResolution + 1) * i + j;
                const topRight = topLeft + 1;
                const bottomLeft = (meshResolution + 1) * (i + 1) + j;
                const bottomRight = bottomLeft + 1;

            triangleindices.push(topLeft, topRight, bottomLeft);
            triangleindices.push(topRight, bottomRight, bottomLeft);
            }
        }


        
        // Part 2: Texturing the Mesh
        // You should replace the example code with correct texture coordinates for the flat map.
        // const textureCoordinates: number[] = [];
        // for(let i = 0; i <= meshResolution; i++){
        //     for(let j = 0; j <= meshResolution; j++){
        //         textureCoordinates.push(j/meshResolution, (1 - i/meshResolution));
        //     }
        // }

        //practice:
        const texCoords: number[] = [];

// Iterate directly over texture coordinate values
for (let y = 0; y <= meshResolution; y++) {
    for (let x = 0; x <= meshResolution; x++) {
        const u = x / meshResolution;
        const v = 1 - y / meshResolution;
        texCoords.push(u, v);
    }
}


        


        // Set the flat map mesh data. This functions, which are part of the Mesh3 class, copy
        // the vertices, normals, indices, and texture coordinates from CPU memory to GPU memory. 
        this.earthMesh.setVertices(mapVertices, true);
        this.earthMesh.setNormals(mapNormals, true);
        this.earthMesh.setIndices(triangleindices);
        this.earthMesh.setTextureCoordinates(texCoords);



        // Part 3: Creating the Globe Mesh
        // You will need to compute another set of vertices and normals for the globe mesh.
        // For debugging purposes, it may be useful to overwrite the flap map vertices and
        // normals using the setVertices() and setNormals() methods above, and then use the
        // wireframe and vertex display modes to visually inspect the structure of the mesh.
        // However, once you are confident the globe vertices and normals are correct, you
        // should to add them to the earth as morph targets using the appropriate functions.
        // You will also need to add code in the convertLatLongToSphere() method below.
        for(let i = 0; i <= meshResolution; i++){
            for(let j = 0; j <= meshResolution; j++){
                const calculatedlatitude = 180 * i/meshResolution - 90;
                const calculateslongitude = 360 * j/meshResolution - 180;
                const positionlines = this.convertLatLongToSphere(calculatedlatitude,calculateslongitude );
                Vertices.push(positionlines);
                const Line = gfx.Vector3.normalize(positionlines);
                Normal.push(Line);
            }
        }
        this.earthMesh.setMorphTargetVertices(Vertices);
        this.earthMesh.setMorphTargetNormals(Normal);
       
        
        // After the mesh geometry is updated, we need to recompute the wireframe.
        // This is only necessary for debugging in the wireframe display mode.
        this.earthMesh.material.updateWireframeBuffer(this.earthMesh);
    }


    public update(deltaTime: number) : void
    {

        // Part 4: Morphing Between the Map and Globe
        // The value of this.globeMode will be changed whenever
        // the user selects flat map or globe mode in the GUI.
        // You should use this boolean to control the morphing
        // of the earth mesh, as described in the readme.
        if(this.globeMode){
            if(this.earthMesh.morphAlpha < 1){
                this.earthMesh.morphAlpha = Math.min(this.earthMesh.morphAlpha + 1 * deltaTime, 1);
            }  
        }
        else{
            if(this.earthMesh.morphAlpha > 0){
                this.earthMesh.morphAlpha = Math.max(this.earthMesh.morphAlpha - 1 * deltaTime, 0);
            }
        } 


    }


    public createEarthquake(record: EarthquakeRecord)
    {
        // Number of milliseconds in 1 year (approx.)
        const duration = 12 * 28 * 24 * 60 * 60;

        // Part 5: Creating the Earthquake Markers
        // Currently, the earthquakes are just placed randomly on the plane. 
        // You will need to update this code to correctly calculate both the 
        // map and globe positions of the markers.

        const mapPosition = this.convertLatLongToPlane(record.latitude, record.longitude);
        const globePosition = this.convertLatLongToSphere(record.latitude, record.longitude);
        const earthquake = new EarthquakeMarker(mapPosition, globePosition, record, duration);

        // Global adjustment to reduce the size. You should probably update the
        // appearance of the earthquake marker in a more meaningful way. 
        earthquake.scale.set(earthquake.magnitude, earthquake.magnitude, earthquake.magnitude);

        // Uncomment this line of code to add the earthquake markers to the scene
        this.add(earthquake);
    }


    public animateEarthquakes(currentTime : number)
    {
        // This code removes earthquake markers after their life has expired
        this.children.forEach((quake: gfx.Node3) => {

            if(quake instanceof EarthquakeMarker)
            {
                const playbackLife = (quake as EarthquakeMarker).getPlaybackLife(currentTime);

                // The earthquake has exceeded its lifespan and should be moved from the scene
                if(playbackLife >= 1)
                {
                    quake.remove();
                }
                // The earthquake position should be updated
                else
                {

                    // Part 6: Morphing the Earthquake Positions
                    // If you have correctly computed the flat map and globe positions
                    // for each earthquake marker in part 5, then you can simply lerp
                    // between them using the same alpha as the earth mesh.
                     quake.position.lerp(quake.mapPosition, quake.globePosition, this.earthMesh.morphAlpha);
                    // const markerSize = ( 1.2 * quake.magnitude) * (1 - playbackLife);
                    // quake.scale.set(markerSize, markerSize, markerSize);
                    //or maybe:
                    //quake.position = gfx.Vector3.lerp(quake.mapPosition, quake.globePosition, this.earthMesh.morphAlpha);



                }
            }
        });

    }


    // This convenience method converts from latitude and longitude (in degrees) to a Vector3 object
    // in the flat map coordinate system described in the readme.
    public convertLatLongToPlane(latitude: number, longitude: number): gfx.Vector3
    {
        return new gfx.Vector3(longitude * Math.PI / 180, latitude * Math.PI / 180, 0);
    }


    // This convenience method converts from latitude and longitude (in degrees) to a Vector3 object
    // in the globe mesh map coordinate system described in the readme.
    public convertLatLongToSphere(latitude: number, longitude: number): gfx.Vector3
    {
        
        // Part 3: Creating the Globe Mesh
        // Add code here to correctly compute the 3D sphere position
        // based on latitude and longitude.
        const latitudeRadians = latitude * (Math.PI / 180); 
        const longitudeRadians = longitude * (Math.PI / 180); 
        const xComponent = Math.cos(latitudeRadians) * Math.sin(longitudeRadians);
        const yComponent = Math.sin(latitudeRadians); 
        const zComponent = Math.cos(latitudeRadians) * Math.cos(longitudeRadians);
        return new gfx.Vector3(xComponent, yComponent, zComponent);



        return new gfx.Vector3();
    }


    // This function toggles between the textured, wireframe, and vertex display modes
    public changeDisplayMode(displayMode : string)
    {
        if (displayMode == 'Textured')
        {
            this.earthMesh.material.materialMode = gfx.MorphMaterialMode.SHADED;
        }
        else if (displayMode == 'Wireframe')
        {
            this.earthMesh.material.materialMode = gfx.MorphMaterialMode.WIREFRAME;
        }
        else if (displayMode == 'Vertices')
        {
            this.earthMesh.material.materialMode = gfx.MorphMaterialMode.VERTICES;
        }
    }
}
