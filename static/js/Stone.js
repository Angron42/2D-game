import Block from './Block.js'
import Texture from './Texture.js'

export default class Stone extends Block {
    static #DEFAULT_TEXTURE = new Texture()
    static async LoadTexture() {
        await this.#DEFAULT_TEXTURE.loadFromUrl('/images/stone.jpg')
        delete this.LoadTexture
    }

    get texture() { return Stone.#DEFAULT_TEXTURE }
}