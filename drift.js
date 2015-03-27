// Constants
var NUM_PARTICLES = 50;
var MIN_VELOCITY = 3;
var MAX_VELOCITY = 10;
var RADIUS = 5;
// Particle positions
var g_particles_pos_buffer = new ArrayBuffer(NUM_PARTICLES * 4 * 2); // 4 bytes per float, 2 floats per position
var g_particles_pos = new Float32Array(g_particles_pos_buffer);
// Particle velocities
var g_particles_vel_buffer = new ArrayBuffer(NUM_PARTICLES * 4 * 2); // 4 bytes per float, 2 floats per position
var g_particles_vel = new Float32Array(g_particles_vel_buffer);
// Rendering
var g_Canvas = document.querySelector('#main');
var g_CanvasCtx = g_Canvas.getContext('2d');
var g_Width = g_Canvas.offsetWidth;
var g_Height = g_Canvas.offsetHeight;
var g_lastTimestamp = 0;
var g_triangles = [];
var g_triangleColors = [];
var Color = (function () {
    function Color(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.a = a || 1.0;
    }
    Color.toDrawingColor = function (c) {
        var legalize = function (d) { return d > 1 ? 1 : d; };
        return {
            r: Math.floor(legalize(c.r) * 255),
            g: Math.floor(legalize(c.g) * 255),
            b: Math.floor(legalize(c.b) * 255),
            a: legalize(c.a)
        };
    };
    Color.toFillStyle = function (c) {
        var dc = Color.toDrawingColor(c);
        return 'rgba( ' + dc.r + ', ' + dc.g + ', ' + dc.b + ', ' + dc.a + ' )';
    };
    Color.white = new Color(1.0, 1.0, 1.0);
    Color.grey = new Color(0.5, 0.5, 0.5);
    Color.black = new Color(0.0, 0.0, 0.0);
    return Color;
})();
function renderFrameCallback(timestampMs) {
    var dtMs = timestampMs - g_lastTimestamp;
    update(dtMs);
    render();
    g_lastTimestamp = timestampMs;
    requestAnimationFrame(renderFrameCallback);
}
function update(dtMs) {
    for (var i = 0; i < NUM_PARTICLES; ++i) {
        g_particles_pos[i * 2 + 0] += g_particles_vel[i * 2 + 0] * (dtMs / 1000);
        g_particles_pos[i * 2 + 1] += g_particles_vel[i * 2 + 1] * (dtMs / 1000);
    }
    var tri_input = new Array(NUM_PARTICLES);
    for (var i = 0; i < NUM_PARTICLES; ++i) {
        tri_input[i] = [g_particles_pos[i * 2 + 0], g_particles_pos[i * 2 + 1]];
    }
    g_triangles = Delaunay.triangulate(tri_input);
    var numTriangles = g_triangles.length / 3;
    for (var i = 0; i < numTriangles; ++i) {
        var oldLength = g_triangleColors.length;
        g_triangleColors.length = numTriangles;
        if (numTriangles > oldLength) {
            for (var j = oldLength; j < numTriangles; ++j) {
                //g_triangleColors[j] = new Color( Math.random(), Math.random(), Math.random(), Math.random() );
                g_triangleColors[j] = new Color(0, 0, 0, Math.random() / 2);
            }
        }
    }
}
function render() {
    // Clear
    g_CanvasCtx.fillStyle = 'rgba( 255, 255, 255, 1 )';
    g_CanvasCtx.fillRect(0, 0, g_Width, g_Height);
    // Draw particles as vertices
    g_CanvasCtx.fillStyle = 'rgba( 0, 0, 0, 0.5 )';
    for (var i = 0; i < NUM_PARTICLES; ++i) {
        g_CanvasCtx.fillRect(g_particles_pos[i * 2 + 0], g_particles_pos[i * 2 + 1], RADIUS, RADIUS);
    }
    for (var i = 0; i < (g_triangles.length / 3); ++i) {
        var tri_a_idx = g_triangles[i * 3 + 0], tri_b_idx = g_triangles[i * 3 + 1], tri_c_idx = g_triangles[i * 3 + 2];
        var tri_a_x = g_particles_pos[tri_a_idx * 2 + 0], tri_a_y = g_particles_pos[tri_a_idx * 2 + 1], tri_b_x = g_particles_pos[tri_b_idx * 2 + 0], tri_b_y = g_particles_pos[tri_b_idx * 2 + 1], tri_c_x = g_particles_pos[tri_c_idx * 2 + 0], tri_c_y = g_particles_pos[tri_c_idx * 2 + 1];
        g_CanvasCtx.fillStyle = Color.toFillStyle(g_triangleColors[i]);
        g_CanvasCtx.beginPath();
        g_CanvasCtx.moveTo(tri_a_x, tri_a_y);
        g_CanvasCtx.lineTo(tri_b_x, tri_b_y);
        g_CanvasCtx.lineTo(tri_c_x, tri_c_y);
        g_CanvasCtx.closePath();
        g_CanvasCtx.fill();
    }
}
function init() {
    g_Canvas.width = g_Width;
    g_Canvas.height = g_Height;
    for (var i = 0; i < NUM_PARTICLES; ++i) {
        g_particles_pos[i * 2 + 0] = Math.random() * g_Width;
        g_particles_pos[i * 2 + 1] = Math.random() * g_Height;
        g_particles_vel[i * 2 + 0] = (MIN_VELOCITY + (Math.random() * (MAX_VELOCITY - MIN_VELOCITY))) * (Math.random() > 0.5 ? -1 : 1);
        g_particles_vel[i * 2 + 1] = (MIN_VELOCITY + (Math.random() * (MAX_VELOCITY - MIN_VELOCITY))) * (Math.random() > 0.5 ? -1 : 1);
    }
    g_lastTimestamp = performance.now();
    requestAnimationFrame(renderFrameCallback);
}
init();
//# sourceMappingURL=drift.js.map