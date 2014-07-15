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
    var _w = 0.2;
    var _p = 0.1;
    var _g = 0.1;
    
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
        optimize: function(config, wrapper) {
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
                    vel.push(0.1*Math.random());
                }
                particles.push(new Particle(pos, score, vel));
                
                if (score > best) {
                    best = score;
                    bestPos = pos;
                }
            }
            
            //iterate the algorithm
            for (var ai = 1; ai < config.numSteps; ai++) {
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
            }
            
            return posToParams(bestPos);
        }
    };
})();

window.addEventListener('load', function() {
    var paramsToOptimize = [[16, 48], [-70, 219]];
    var field = Faucet.drip(paramsToOptimize, 1);
    var argMax = Locust.optimize({
        numSteps: 50,
        swarmSize: 16,
        params: paramsToOptimize,
    }, field);
    var max = field.eval(argMax);
    
    console.log('Maximum possible: '+1);
    console.log(max+' achieved with params: '+JSON.stringify(argMax));
});









