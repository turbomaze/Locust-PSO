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
    var _w = 0.729;
    var _p = 0.05;
    var _g = 0.03;
    var _r = 0.015; //random component
    var _iv = 0.5; //initial velocity constant

    /***********
     * objects */ 
    function Particle(pos, score, vel) {
        this.pos = pos.slice();
        this.best = score;
        this.bestPos = pos.slice();
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

    return { //return public functions
        /** @params
          * config  --- JSON that changes the behavior of Locust
          *             {
          *                 numSteps: number of steps to run the PSO
          *                 swarmSize: number of particles in the swarm
          *                 params: array of [min, max] pairs, one per
          *                         parameter
          *                 randomVel: whether or not to include a random
          *                            component in the velocities
          *             }
          * wrapper --- object with an 'eval' function that outputs a score
          *             for a given combination of parameters; the field
          *             over which to optimize
          * done    --- function to call when the optimization is finished;
          *             receives the best parameters found
          * each    --- optional function that is run each iteration;
          *             receives all the particles and the current bestPos
          *
          * @return
          * the best set of parameters discovered using the conditions
          * outlined in config
        **/
        optimize: function(config, wrapper, done, each) {
            function getRandPos() {
                var pos = [];
                for (var ai = 0; ai < n; ai++) pos.push(Math.random());
                return pos;
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

            //optional config items
            if (!config.hasOwnProperty('randomVel')) {
                config.randomVel = false;
            }
            
            //prepare the working variables
            var n = config.params.length; //number of dimensions
  
            //init the particles
            var particles = [];
            var best = -Infinity;
            var bestPos = [];
            for (var ai = 0; ai < config.swarmSize; ai++) {
                var pos = getRandPos();
                var score = wrapper.eval(posToParams(pos));
                var vel = [];
                for (var bi = 0; bi < n; bi++) {
                    vel.push(2*_iv*Math.random()-_iv);
                }
                particles.push(new Particle(pos, score, vel));
                
                if (score > best) {
                    best = score;
                    bestPos = pos.slice();
                }
            }

            if (each) each(particles, bestPos);
            
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
                        if (config.randomVel) {
                            p.vel[ti] += 2*_r*Math.random()-_r;
                        }
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
                        p.bestPos = p.pos.slice();
                    }
                    if (newScore > best) {
                        best = newScore;
                        bestPos = p.pos.slice();
                    }
                }

                if (each) each(particles, bestPos);
                
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
                    done(posToParams(bestPos));
                }
            );
        }
    };
})();

window.addEventListener('load', function() {
    //what to optimize over
    var paramsToOptimize = [[0, 512], [0, 512]];
    var field = Faucet.drip(paramsToOptimize, 1);
    
    //prepare the canvas variables
    var canv = document.getElementById('c');
    canv.width = paramsToOptimize[0][1];
    canv.height = paramsToOptimize[1][1];
    var ctx = canv.getContext('2d');
    
    //perform the optimization
    Locust.optimize({
        numSteps: 70,
        swarmSize: 16,
        params: paramsToOptimize,
        randomVel: true
    }, field, function getOptimization(argMax) {
        var max = field.eval(argMax);
        console.log('Maximum possible: '+1);
        console.log(max+' achieved with params: '+JSON.stringify(argMax));
    }, function drawParticles(particles, bestPos) {
        function posToParams(pos) {
            var xs = [];
            for (var ai = 0; ai < paramsToOptimize.length; ai++) {
                var range = paramsToOptimize[ai][1] - paramsToOptimize[ai][0];
                var param = pos[ai]*range+paramsToOptimize[ai][0];
                xs.push(param);
            }
            return xs;
        }
    
        //clear the canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canv.width, canv.height);
        
        //draw the swarm's best
        var cgbestpos = posToParams(bestPos);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(cgbestpos[0]-4, cgbestpos[1]-4, 8, 8);

        //draw the particles
        for (var ai = 0; ai < particles.length; ai++) {
            var cpos = posToParams(particles[ai].pos);
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(cpos[0]-1.5, cpos[1]-1.5, 3, 3);
        }
    });
});









