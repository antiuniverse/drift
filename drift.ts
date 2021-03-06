// Constants
var NUM_PARTICLES = 1000;
var MIN_VELOCITY = 5;
var MAX_VELOCITY = 30;
var RADIUS = 5;

// Particle positions
var g_particles_pos_buffer = new ArrayBuffer( NUM_PARTICLES * 4 * 2 ); // 4 bytes per float, 2 floats per position (X, Y)
var g_particles_pos = new Float32Array( g_particles_pos_buffer );

var g_particles_color_buffer = new ArrayBuffer( NUM_PARTICLES * 4 ); // 32-bit RGBA
var g_particles_color = new Uint8Array( g_particles_color_buffer );

// Particle velocities
var g_particles_vel_buffer = new ArrayBuffer( NUM_PARTICLES * 4 * 2 ); // 4 bytes per float, 2 floats per velocity (X, Y)
var g_particles_vel = new Float32Array( g_particles_vel_buffer );

// Rendering
var g_Canvas : HTMLCanvasElement = <HTMLCanvasElement>document.querySelector( '#main' );
var g_CanvasCtx : CanvasRenderingContext2D = g_Canvas.getContext( '2d' );
var g_Width = g_Canvas.offsetWidth;
var g_Height = g_Canvas.offsetHeight;

var g_lastTimestamp = 0;

var g_triangles : Array<number> = [];
var g_updateCount : number = 0;



function renderFrameCallback( timestampMs : number ) {
    var dtMs = timestampMs - g_lastTimestamp;
    update( dtMs );
    render();
    g_lastTimestamp = timestampMs;
    requestAnimationFrame( renderFrameCallback );
}

function update( dtMs : number ) {
    // Apply velocity
    for (var i = 0; i < NUM_PARTICLES; ++i) {
        g_particles_pos[i*2 + 0] += g_particles_vel[i*2 + 0] * (dtMs / 1000);
        g_particles_pos[i*2 + 1] += g_particles_vel[i*2 + 1] * (dtMs / 1000);
    }

    // If particles have left the canvas bounds, make sure their velocity is reflected.
    for (var i = 0; i < NUM_PARTICLES; ++i) {

    }

    if ( g_updateCount++ % 300 == 0 ) {
        var tri_input = new Array( NUM_PARTICLES );
        for ( var i = 0; i < NUM_PARTICLES; ++i ) {
            tri_input[i] = [g_particles_pos[i * 2 + 0], g_particles_pos[i * 2 + 1]];
        }
        g_triangles = Delaunay.triangulate( tri_input );
    }
}

function render() {
    // Clear
    g_CanvasCtx.fillStyle = 'rgba( 255, 255, 255, 1 )';
    g_CanvasCtx.fillRect( 0, 0, g_Width, g_Height );

    /*
    // Draw particles as vertices
    g_CanvasCtx.fillStyle = 'rgba( 0, 0, 0, 0.5 )';
    for (var i = 0; i < NUM_PARTICLES; ++i) {
        g_CanvasCtx.fillRect( g_particles_pos[i*2 + 0] - RADIUS / 2, g_particles_pos[i*2 + 1] - RADIUS / 2, RADIUS, RADIUS );
    }
    */

    for (var i = 0; i < (g_triangles.length / 3); ++i) {
        var tri_a_idx = g_triangles[i*3 + 0],
            tri_b_idx = g_triangles[i*3 + 1],
            tri_c_idx = g_triangles[i*3 + 2];

        var tri_a_x = g_particles_pos[tri_a_idx*2 + 0],
            tri_a_y = g_particles_pos[tri_a_idx*2 + 1],
            tri_b_x = g_particles_pos[tri_b_idx*2 + 0],
            tri_b_y = g_particles_pos[tri_b_idx*2 + 1],
            tri_c_x = g_particles_pos[tri_c_idx*2 + 0],
            tri_c_y = g_particles_pos[tri_c_idx*2 + 1];

        var centroid_x = (tri_a_x + tri_b_x + tri_c_x) / 3,
            centroid_y = (tri_a_y + tri_b_y + tri_c_y) / 3;

        var normalized_x = centroid_x / g_Width,
            normalized_y = centroid_y / g_Height;

        var color_r = Math.floor( normalized_x * 255 ),
            color_g = Math.floor( normalized_y * 255 ),
            color_b = 255,
            color_a = g_particles_color[tri_a_idx*4 + 3] / 255;

        /*
        if ( normalized_x > 0.7 && normalized_x < 0.8 ) {
            color_r = 0;
            color_g = 0;
            color_b = 0;
            color_a = 1;
        }
        */

        g_CanvasCtx.fillStyle = 'rgba( ' + color_r + ', ' + color_g + ', ' + color_b + ', ' + color_a + ' )';
        g_CanvasCtx.beginPath();
        g_CanvasCtx.moveTo( tri_a_x, tri_a_y );
        g_CanvasCtx.lineTo( tri_b_x, tri_b_y );
        g_CanvasCtx.lineTo( tri_c_x, tri_c_y );
        g_CanvasCtx.closePath();
        g_CanvasCtx.fill();
    }
}

function init(): void {
    g_Canvas.width = g_Width;
    g_Canvas.height = g_Height;

    for ( var i = 0; i < NUM_PARTICLES; ++i ) {
        g_particles_pos[i*2 + 0] = Math.random() * g_Width;
        g_particles_pos[i*2 + 1] = Math.random() * g_Height;

        g_particles_vel[i*2 + 0] = (MIN_VELOCITY + (Math.random() * (MAX_VELOCITY - MIN_VELOCITY))) * (Math.random() > 0.5 ? -1 : 1);
        g_particles_vel[i*2 + 1] = (MIN_VELOCITY + (Math.random() * (MAX_VELOCITY - MIN_VELOCITY))) * (Math.random() > 0.5 ? -1 : 1);

        g_particles_color[i*4 + 0] = 0;
        g_particles_color[i*4 + 1] = 0;
        g_particles_color[i*4 + 2] = 0;
        g_particles_color[i*4 + 3] = 128;
    }

    g_lastTimestamp = performance.now();
    requestAnimationFrame( renderFrameCallback );
}



init();