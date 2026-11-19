import {describe,it,expect} from 'vitest';
import {totals,canPublish} from './hotel-menu';
describe('hotel rules',()=>{it('adds 15% VAT to an ETB 1000 order',()=>expect(totals(1000,15)).toEqual({subtotal:1000,vat:150,total:1150}));it('reads the changed VAT rate',()=>expect(totals(1000,10).total).toBe(1100));it('cannot publish without a photo',()=>expect(canPublish(null,true)).toBe(false));it('cannot publish without photo-match confirmation',()=>expect(canPublish('https://example.com/doro.jpg',false)).toBe(false));it('allows a matching confirmed image',()=>expect(canPublish('https://example.com/doro.jpg',true)).toBe(true));});
import {effectivePrice} from './hotel-menu';
describe('VAT and discounts',()=>{
 it('does not add VAT twice when prices include VAT',()=>expect(totals(1150,15,true)).toEqual({subtotal:1000,vat:150,total:1150}));
 it('applies a 10% discount to ETB 500',()=>expect(effectivePrice(500,10)).toBe(450));
 it('caps discounts at 90%',()=>expect(effectivePrice(1000,95)).toBe(100));
});
