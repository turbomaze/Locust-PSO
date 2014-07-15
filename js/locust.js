/*******************\
| Locust - Particle |
|  Swarm Optimizer  |
| @author Anthony   |
| @version 0.1      |
| @date 2014/07/14  |
| @edit 2014/07/14  |
\*******************/

var Locust = (function() {
    /**********
     * config */
    var _w = 0.6;
    var _p = 0.01;
    var _g = 0.005;
    var draw = true; //whether or not to draw the particles (2d)
    
    /***********
     * objects */ 
    function Particle(pos, score, vel) {
        this.pos = pos;
        this.best = score;
        this.bestPos = pos;
        this.vel = vel;
    }

    /********************
     * helper functions */
    //stolen from http://stackoverflow.com/questions/4288759/asynchronous-for-cycle-in-javascript
    function asyncLoop(iterations, func, callback) {
        var index = 0;
        var done = false;
        var loop = {
            next: function() {
                if (done) return;
                if (index < iterations) {
                    index += 1;
                    func(loop);
                } else {
                    done = true;
                    if (callback) callback();
                }
            },
            iteration: function() {
                return index - 1;
            },
            break: function() {
                done = true;
                if (callback) callback();
            }
        };
        loop.next();
        return loop;
    }
    function getRandInt(low, high) { //output is in [low, high)
        return Math.floor(this.getRandFloat(low, high));
    }
    function getRandFloat(low, high) { //output is in [low, high)
        return low + Math.random()*(high-low);
    }

    return { //return public functions
        /** @params
          * config   --- JSON that changes the behavior of Locust
          *              {
          *                  numSteps: number of steps to run the PSO
          *                  swarmSize: number of particles in the swarm
          *                  params: array of [min, max] pairs, one per
          *                          parameter
          *              }
          * wrapper  --- object with an 'eval' function that outputs a score
          *              for a given combination of parameters; the field
          *              over which to optimize
          *
          * @return
          * the best set of parameters discovered using the conditions
          * outlined in config
        **/
        optimize: function(config, wrapper, next) {
            function getRandPos() {
                var pos = [];
                for (var ai = 0; ai < n; ai++) pos.push(Math.random());
                return pos;
            }
            function getRandParams() {
                var xs = [];
                for (var ai = 0; ai < config.params.length; ai++) {
                    xs.push(getRandFloat(
                        config.params[ai][0], config.params[ai][1] 
                    ));
                } 
                return xs;
            }
            function posToParams(pos) {
                var xs = [];
                for (var ai = 0; ai < n; ai++) {
                    var range = config.params[ai][1] - config.params[ai][0];
                    var param = pos[ai]*range+config.params[ai][0];
                    xs.push(param);
                }
                return xs;
            }
            function drawParticles() {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canv.width, canv.height);
                
                //draw the swarm's best
                var cgbestpos = posToParams(bestPos);
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(cgbestpos[0]-4, cgbestpos[1]-4, 10, 10);

                for (var ai = 0; ai < config.swarmSize; ai++) {
                    var cpbestpos = posToParams(particles[ai].bestPos);
                    ctx.fillStyle = '#0000FF';
                    ctx.fillRect(cpbestpos[0]-1.5, cpbestpos[1]-1.5, 3, 3);
                
                    var cpos = posToParams(particles[ai].pos);
                    ctx.fillStyle = '#FF0000';
                    ctx.fillRect(cpos[0]-1, cpos[1]-1, 2, 2);
                }
            }
            
            var n = config.params.length; //number of dimensions
            var canv = document.getElementById('c');
            if (draw) {
                canv.width = 512;
                canv.height = 512;
            } else canv.parentNode.removeChild(canv);
            var ctx = canv.getContext('2d');
            
            //init the particles
            var particles = [];
            var best = -Infinity;
            var bestPos = [];
            for (var ai = 0; ai < config.swarmSize; ai++) {
                var pos = getRandPos();
                var score = wrapper.eval(posToParams(pos));
                var vel = [];
                for (var bi = 0; bi < n; bi++) {
                    vel.push(0.4*Math.random()-0.2);
                }
                particles.push(new Particle(pos, score, vel));
                
                if (score > best) {
                    best = score;
                    bestPos = pos;
                }
            }

            //draw the initial particles
            if (draw) drawParticles();
            
            //iterate the algorithm
            var asyncLoopPSOSteps = function(callback) {
                for (var bi = 0; bi < config.swarmSize; bi++) {
                    var p = particles[bi];
                    
                    //update the velocity
                    var rp = Math.random();
                    var rg = Math.random();
                    for (var ti = 0; ti < n; ti++) {
                        //diff from personal best
                        var pdiff = p.bestPos[ti]-p.pos[ti];
                        //diff from global best
                        var gdiff = bestPos[ti]-p.pos[ti];
                        p.vel[ti] = _w*p.vel[ti]+_p*rp*pdiff+_g*rg*gdiff;
                    }
                    
                    //update the position
                    for (var ti = 0; ti < n; ti++) {
                        p.pos[ti] = p.pos[ti]+p.vel[ti];
                        p.pos[ti] = Math.max(
                            0, Math.min(p.pos[ti], 1)
                        ); //keep it in bounds
                    }
                    
                    //update the best score
                    var newScore = wrapper.eval(posToParams(p.pos));
                    if (newScore > p.best) {
                        p.best = newScore;
                        p.bestPos = p.pos;
                    }
                    if (newScore > best) {
                        best = newScore;
                        bestPos = p.pos;
                    }
                }
                
                if (draw) drawParticles();
                
                //call the next iteration
                setTimeout(function() { callback(true); }, 6); 
            };
            asyncLoop(config.numSteps-1,
                function(loop) {
                    asyncLoopPSOSteps(function(keepGoing) {
                        if (keepGoing) loop.next();
                        else loop.break();
                    });
                }, 
                function() {
                    next(posToParams(bestPos));
                }
            );
        }
    };
})();

var field;
window.addEventListener('load', function() {
    var paramsToOptimize = [[0, 512], [0, 512]];
    field = Faucet.drip(paramsToOptimize, 1);
    Locust.optimize({
        numSteps: 70,
        swarmSize: 16,
        params: paramsToOptimize,
    }, field, function(argMax) {
        var max = field.eval(argMax);
        console.log('Maximum possible: '+1);
        console.log(max+' achieved with params: '+JSON.stringify(argMax));
    });
});









