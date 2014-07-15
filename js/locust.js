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

    /*************
     * constants */

    /*********************
     * working variables */

    /***********
     * objects */

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
            function getRandParams() {
                var xs = [];
                for (var ai = 0; ai < config.params.length; ai++) {
                    xs.push(getRandFloat(
                        config.params[ai][0], config.params[ai][1] 
                    ));
                } 
                return xs;
            }

            var best = [null, -Infinity];
            for (var ai = 0; ai < config.numSteps; ai++) {
                var xs = getRandParams();
                var y = wrapper.eval(xs);
                if (y > best[1]) {
                    best[0] = xs;
                    best[1] = y;
                }
            }
            
            return best[0];
        }
    };
})();

window.addEventListener('load', function() {
    var paramsToOptimize = [[16, 48], [-70, 219]];
    var field = Faucet.drip(paramsToOptimize, 1);
    var argMax = Locust.optimize({
        numSteps: 20,
        swarmSize: 16,
        params: paramsToOptimize,
    }, field);
    var max = field.eval(argMax);
    console.log('Maximum possible: '+1);
    console.log(max+' achieved with params: '+JSON.stringify(argMax));
});









