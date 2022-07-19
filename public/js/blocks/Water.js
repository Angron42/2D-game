import { isPositiveInteger } from '../dataValidator.js'
import Block from '../Block.js'
import Texture from '../Texture.js'

export default class Water extends Block {
    static #MIN_LEVEL = 0
    static #MAX_LEVEL = 1000
    static #LEVEL_STEP = 100

    static #update(type, worldData, x, y) {
        if (
            type !== 'block' ||
            y + 1 >= worldData.height
        ) {
            return false
        }
        
        if (this.properties.level === 0) {
            worldData.removeBlock(x, y)
            return true
        }

        const cellBelow = worldData.worldMatrix[x][y + 1]

        if (!cellBelow.block) {
            return false
        }

        if (cellBelow.block instanceof Water) {
            if (cellBelow.block.properties.level < Water.MAX_LEVEL) {
                const level = cellBelow.block.properties.level + this.properties.level - 1000
                if (level < 0) {
                    cellBelow.block.properties.level += this.properties.level
                    worldData.removeBlock(x, y)
                    cellBelow.block.texture.update()
                    cellBelow.texture.update()
                    return true
                }

                cellBelow.block.properties.level = 1000
                this.properties.level = level
                this.texture.update()

                cellBelow.block.texture.update()
                cellBelow.texture.update()
            }
        }

        if (this.properties.level === Water.LEVEL_STEP) {
            return false
        }

        function updateNearestWaterBlocks() {
            for (let i = x - 1; i <= x + 1; i++) {
                for (let j = y - 1; j <= y + 1; j++) {
                    if (
                        i < 0 ||
                        j < 0 ||
                        i >= worldData.width ||
                        j >= worldData.height ||
                        (i === x && j === x)
                    ) {
                        continue
                    }

                    const block = worldData.worldMatrix[i][j].block

                    if (
                        !block ||
                        block.constructor !== Water
                    ) {
                        continue
                    }

                    worldData.updateCell(i, j)
                }
            }
        }
        
        const leftBlock = x - 1 < 0 || worldData.worldMatrix[x - 1][y].block
        const rightBlock = x + 1 >= worldData.width || worldData.worldMatrix[x + 1][y].block

        if (
            (
                leftBlock === null
                || (
                    leftBlock instanceof Water
                    && leftBlock.properties.level + Water.LEVEL_STEP < this.properties.level
                )
            ) && (
                rightBlock === null
                || (
                    rightBlock instanceof Water
                    && rightBlock.properties.level + Water.LEVEL_STEP < this.properties.level
                )
            )
        ) {
            let leftWaterLevel = leftBlock === null ? 0 : leftBlock.properties.level
            let rightWaterLevel = rightBlock === null ? 0 : rightBlock.properties.level
            let waterLevel = this.properties.level
            
            const levelSum = (leftWaterLevel + waterLevel + rightWaterLevel)
            const avgLevel = levelSum / 3

            leftWaterLevel = avgLevel
            rightWaterLevel = avgLevel
            waterLevel = avgLevel

            if (levelSum % (Water.LEVEL_STEP * 3) >= Water.LEVEL_STEP) {
                waterLevel += Water.LEVEL_STEP
            }

            if (levelSum % (Water.LEVEL_STEP * 3) === (Water.LEVEL_STEP * 2)) {
                if (Math.random() < 0.5) {
                    leftWaterLevel += Water.LEVEL_STEP
                } else {
                    rightWaterLevel += Water.LEVEL_STEP
                }
            }

            let leftWater = leftBlock
            let rightWater = rightBlock

            if (leftBlock === null) {
                leftWater = new Water(leftWaterLevel)
                worldData.placeBlock(x - 1, y, leftWater)
            } else {
                leftBlock.properties.level = leftWaterLevel
                leftBlock.texture.update()
            }

            if (rightBlock === null) {
                rightWater = new Water(rightWaterLevel)
                worldData.placeBlock(x + 1, y, rightWater)
            } else {
                rightBlock.properties.level = rightWaterLevel
                rightBlock.texture.update()
            }

            this.properties.level = waterLevel
            this.texture.update()
            
            worldData.worldMatrix[x - 1][y].texture.update()
            worldData.worldMatrix[x + 1][y].texture.update()

            updateNearestWaterBlocks()
            
            return true
        }

        if (
            leftBlock === null
            || (
                leftBlock instanceof Water
                && leftBlock.properties.level + Water.LEVEL_STEP < this.properties.level
            )
        ) {
            let leftWaterLevel = leftBlock === null ? 0 : leftBlock.properties.level
            let waterLevel = this.properties.level
            
            const levelSum = (leftWaterLevel + waterLevel)
            const avgLevel = levelSum / 2

            leftWaterLevel = avgLevel
            waterLevel = avgLevel

            if (levelSum % (Water.LEVEL_STEP * 2) === Water.LEVEL_STEP) {
                waterLevel += Water.LEVEL_STEP
            }

            let leftWater = leftBlock

            if (leftBlock === null) {
                leftWater = new Water(leftWaterLevel)
                worldData.placeBlock(x - 1, y, leftWater)
            } else {
                leftBlock.properties.level = leftWaterLevel
                leftBlock.texture.update()
            }

            this.properties.level = waterLevel
            this.texture.update()
            
            worldData.worldMatrix[x - 1][y].texture.update()
            updateNearestWaterBlocks()
            
            return true
        }

        if (
            rightBlock === null
            || (
                rightBlock instanceof Water
                && rightBlock.properties.level + Water.LEVEL_STEP < this.properties.level
            )
        ) {
            let rightWaterLevel = rightBlock === null ? 0 : rightBlock.properties.level
            let waterLevel = this.properties.level
            
            const levelSum = (rightWaterLevel + waterLevel)
            const avgLevel = levelSum / 2

            rightWaterLevel = avgLevel
            waterLevel = avgLevel

            if (levelSum % (Water.LEVEL_STEP * 2) === Water.LEVEL_STEP) {
                waterLevel += Water.LEVEL_STEP
            }

            let rightWater = rightBlock

            if (rightBlock === null) {
                rightWater = new Water(rightWaterLevel)
                worldData.placeBlock(x + 1, y, rightWater)
            } else {
                rightBlock.properties.level = rightWaterLevel
                rightBlock.texture.update()
            }

            this.properties.level = waterLevel
            this.texture.update()
            
            worldData.worldMatrix[x + 1][y].texture.update()
            updateNearestWaterBlocks()

            return true
        }
    }

    static #DEFAULT_TEXTURE = new Texture().create(function(ctx, canvas, params) {
        if (!isPositiveInteger(params.size)) {
            params.size = 16
        }

        this.setSize(params.size)
        this.setBackground('#4444ee')
    })

    #texture

    constructor(level = Water.MAX_LEVEL - Water.LEVEL_STEP * 2) {
        super({
            properties: {
                hasGravity: true,
                minLevel: Water.MIN_LEVEL,
                maxLevel: Water.MAX_LEVEL,
                levelStep: Water.LEVEL_STEP,
                level
            },
            onupdate: [Water.#update]
        })

        this.#texture = new Texture().create((ctx, canvas, params) => {
            if (!isPositiveInteger(params.size)) {
                params.size = 16
            }
            
            canvas.width = params.size
            canvas.height = params.size

            const levelK = Math.floor(params.size * (this.properties.level / this.properties.maxLevel))

            ctx.fillStyle = '#4444ee'
            ctx.fillRect(0, params.size - levelK, params.size, levelK)
        })
    }

    get texture() { return this.#texture }
    
    static get texture() { return this.#DEFAULT_TEXTURE }
    static get MIN_LEVEL() { return this.#MIN_LEVEL }
    static get MAX_LEVEL() { return this.#MAX_LEVEL }
    static get LEVEL_STEP() { return this.#LEVEL_STEP }
}