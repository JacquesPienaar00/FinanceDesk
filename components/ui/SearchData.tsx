// components/SearchData.tsx
interface SearchItem {
 label: string;
 description: string;
 url: string;
}

const SearchData = (): SearchItem[] => {
 return [
   { label: 'Home', url: '/' ,description:'Jacques'},
   { label: 'About Us', url: '/about' , description:'Hello'},
   { label: 'Services', url: '/services' ,description:'Hello'},
   { label: 'gg', url: '/contact' ,description:'Hello'},
   { label: 'Blog', url: '/blog' ,description:'Hello' },
   { label: 'Careers', url: '/careers' ,description:'Hello'},
   
 ];
};

export default SearchData;
